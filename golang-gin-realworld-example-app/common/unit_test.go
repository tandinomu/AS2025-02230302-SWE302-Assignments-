package common

import (
	"bytes"
	"errors"
	"fmt"
	"time"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/gin-gonic/gin"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestConnectingDatabase(t *testing.T) {
	asserts := assert.New(t)
	db := Init()
	// Test create & close DB
	_, err := os.Stat("./../gorm.db")
	asserts.NoError(err, "Db should exist")
	asserts.NoError(db.DB().Ping(), "Db should be able to ping")

	// Test get a connecting from connection pools
	connection := GetDB()
	asserts.NoError(connection.DB().Ping(), "Db should be able to ping")
	db.Close()

	// Test DB exceptions
	os.Chmod("./../gorm.db", 0000)
	db = Init()
	asserts.Error(db.DB().Ping(), "Db should not be able to ping")
	db.Close()
	os.Chmod("./../gorm.db", 0644)
}

func TestConnectingTestDatabase(t *testing.T) {
	asserts := assert.New(t)
	// Test create & close DB
	db := TestDBInit()
	_, err := os.Stat("./../gorm_test.db")
	asserts.NoError(err, "Db should exist")
	asserts.NoError(db.DB().Ping(), "Db should be able to ping")
	db.Close()

	// Test testDB exceptions
	os.Chmod("./../gorm_test.db", 0000)
	db = TestDBInit()
	_, err = os.Stat("./../gorm_test.db")
	asserts.NoError(err, "Db should exist")
	asserts.Error(db.DB().Ping(), "Db should not be able to ping")
	os.Chmod("./../gorm_test.db", 0644)

	// Test close delete DB
	TestDBFree(db)
	_, err = os.Stat("./../gorm_test.db")

	asserts.Error(err, "Db should not exist")
}

func TestRandString(t *testing.T) {
	asserts := assert.New(t)

	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	str := RandString(0)
	asserts.Equal(str, "", "length should be ''")

	str = RandString(10)
	asserts.Equal(len(str), 10, "length should be 10")
	for _, ch := range str {
		asserts.Contains(letters, ch, "char should be a-z|A-Z|0-9")
	}
}

func TestGenToken(t *testing.T) {
	asserts := assert.New(t)

	token := GenToken(2)

	asserts.IsType(token, string("token"), "token type should be string")
	asserts.Len(token, 115, "JWT's length should be 115")
}

func TestNewValidatorError(t *testing.T) {
	asserts := assert.New(t)

	type Login struct {
		Username string `form:"username" json:"username" binding:"required,alphanum,min=4,max=255"`
		Password string `form:"password" json:"password" binding:"required,min=8,max=255"`
	}

	var requestTests = []struct {
		bodyData       string
		expectedCode   int
		responseRegexg string
		msg            string
	}{
		{
			`{"username": "wangzitian0","password": "0123456789"}`,
			http.StatusOK,
			`{"status":"you are logged in"}`,
			"valid data and should return StatusCreated",
		},
		{
			`{"username": "wangzitian0","password": "01234567866"}`,
			http.StatusUnauthorized,
			`{"errors":{"user":"wrong username or password"}}`,
			"wrong login status should return StatusUnauthorized",
		},
		{
			`{"username": "wangzitian0","password": "0122"}`,
			http.StatusUnprocessableEntity,
			`{"errors":{"Password":"{min: 8}"}}`,
			"invalid password of too short and should return StatusUnprocessableEntity",
		},
		{
			`{"username": "_wangzitian0","password": "0123456789"}`,
			http.StatusUnprocessableEntity,
			`{"errors":{"Username":"{key: alphanum}"}}`,
			"invalid username of non alphanum and should return StatusUnprocessableEntity",
		},
	}

	r := gin.Default()

	r.POST("/login", func(c *gin.Context) {
		var json Login
		if err := Bind(c, &json); err == nil {
			if json.Username == "wangzitian0" && json.Password == "0123456789" {
				c.JSON(http.StatusOK, gin.H{"status": "you are logged in"})
			} else {
				c.JSON(http.StatusUnauthorized, NewError("user", errors.New("wrong username or password")))
			}
		} else {
			c.JSON(http.StatusUnprocessableEntity, NewValidatorError(err))
		}
	})

	for _, testData := range requestTests {
		bodyData := testData.bodyData
		req, err := http.NewRequest("POST", "/login", bytes.NewBufferString(bodyData))
		req.Header.Set("Content-Type", "application/json")
		asserts.NoError(err)

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		asserts.Equal(testData.expectedCode, w.Code, "Response Status - "+testData.msg)
		asserts.Regexp(testData.responseRegexg, w.Body.String(), "Response Content - "+testData.msg)
	}
}

func TestNewError(t *testing.T) {
	assert := assert.New(t)

	db := TestDBInit()
	type NotExist struct {
		heheda string
	}
	db.AutoMigrate(NotExist{})

	commenError := NewError("database", db.Find(NotExist{heheda: "heheda"}).Error)
	assert.IsType(commenError, commenError, "commenError should have right type")
	assert.Equal(map[string]interface{}(map[string]interface{}{"database": "no such table: not_exists"}),
		commenError.Errors, "commenError should have right error info")
}
// Test 1: JWT Token Generation with Different User IDs
func TestGenToken_DifferentUserIDs(t *testing.T) {
	asserts := assert.New(t)
	
	// Test with different user IDs
	token1 := GenToken(1)
	token2 := GenToken(2)
	token3 := GenToken(100)
	
	// All tokens should be valid strings
	asserts.IsType(string(""), token1)
	asserts.IsType(string(""), token2)
	asserts.IsType(string(""), token3)
	
	// Tokens should be different for different user IDs
	asserts.NotEqual(token1, token2, "Tokens for different users should be different")
	asserts.NotEqual(token2, token3, "Tokens for different users should be different")
	
	// All tokens should have reasonable lengths (JWT format)
	// Token length varies based on user ID, but should be > 100 characters
	asserts.Greater(len(token1), 100)
	asserts.Greater(len(token2), 100)
	asserts.Greater(len(token3), 100)
}

// Test 2: JWT Token Contains Correct User ID
func TestGenToken_ContainsUserID(t *testing.T) {
	asserts := assert.New(t)
	
	userID := uint(42)
	token := GenToken(userID)
	
	// Parse the token
	parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		return []byte(NBSecretPassword), nil
	})
	
	asserts.NoError(err, "Token should be parseable")
	asserts.True(parsedToken.Valid, "Token should be valid")
	
	// Check claims
	if claims, ok := parsedToken.Claims.(jwt.MapClaims); ok {
		// The ID is stored as float64 in JWT claims
		asserts.Equal(float64(userID), claims["id"], "Token should contain correct user ID")
	}
}

// Test 3: JWT Token Expiration
func TestGenToken_Expiration(t *testing.T) {
	asserts := assert.New(t)
	
	token := GenToken(1)
	
	// Parse the token
	parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		return []byte(NBSecretPassword), nil
	})
	
	asserts.NoError(err)
	
	if claims, ok := parsedToken.Claims.(jwt.MapClaims); ok {
		exp := int64(claims["exp"].(float64))
		now := time.Now().Unix()
		
		// Token should expire approximately 24 hours from now
		// Allow 5 second tolerance
		expectedExp := now + 24*60*60
		asserts.InDelta(expectedExp, exp, 5, "Token should expire in 24 hours")
	}
}

// Test 4: RandString Edge Cases
func TestRandString_EdgeCases(t *testing.T) {
	asserts := assert.New(t)
	
	// Test with 0 length
	str0 := RandString(0)
	asserts.Equal("", str0, "RandString(0) should return empty string")
	
	// Test with 1 character
	str1 := RandString(1)
	asserts.Len(str1, 1)
	
	// Test with large number
	str1000 := RandString(1000)
	asserts.Len(str1000, 1000)
	
	// Test randomness - generate multiple strings and ensure they're different
	str10a := RandString(10)
	str10b := RandString(10)
	str10c := RandString(10)
	
	// With 10 characters, it's extremely unlikely all three are the same
	differentCount := 0
	if str10a != str10b {
		differentCount++
	}
	if str10b != str10c {
		differentCount++
	}
	if str10a != str10c {
		differentCount++
	}
	
	asserts.GreaterOrEqual(differentCount, 2, "Random strings should be different")
}

// Test 5: CommonError Structure
func TestCommonError_Structure(t *testing.T) {
	asserts := assert.New(t)
	
	// Test NewError function
	err := NewError("testKey", fmt.Errorf("test error message"))
	asserts.NotNil(err.Errors)
	asserts.Equal("test error message", err.Errors["testKey"])
	
	// Test with different keys
	dbError := NewError("database", fmt.Errorf("connection failed"))
	asserts.Equal("connection failed", dbError.Errors["database"])
	
	authError := NewError("authentication", fmt.Errorf("invalid credentials"))
	asserts.Equal("invalid credentials", authError.Errors["authentication"])
	
	// Test multiple errors
	multiError := CommonError{
		Errors: make(map[string]interface{}),
	}
	multiError.Errors["field1"] = "error1"
	multiError.Errors["field2"] = "error2"
	
	asserts.Len(multiError.Errors, 2)
	asserts.Equal("error1", multiError.Errors["field1"])
	asserts.Equal("error2", multiError.Errors["field2"])
}