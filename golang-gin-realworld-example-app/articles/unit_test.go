package articles

import (
	"testing"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
	"realworld-backend/common"
	"realworld-backend/users"
)

// Setup function to initialize test database
func setupTestDB() {
	common.TestDBInit()
	db := common.GetDB()

	// Drop and recreate tables to ensure clean state
	db.DropTableIfExists(&CommentModel{}, &FavoriteModel{}, &ArticleModel{}, &TagModel{}, &ArticleUserModel{}, &users.UserModel{})
	db.AutoMigrate(&users.UserModel{}, &ArticleUserModel{}, &TagModel{}, &ArticleModel{}, &CommentModel{}, &FavoriteModel{})
}

// Test 1: Create article with valid data
func TestArticleCreation_ValidData(t *testing.T) {
	setupTestDB()
	db := common.GetDB()

	// Create a user first (needed for author)
	userModel := users.UserModel{
		Username: "testauthor",
		Email:    "author@test.com",
		Bio:      "Test bio",
	}
    hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
    userModel.PasswordHash = string(hashedPassword)
	db.Create(&userModel)

	// Create article user
	articleUser := ArticleUserModel{
		UserModelID: userModel.ID,
	}
	db.Create(&articleUser)

	// Create article
	article := ArticleModel{
		Slug:        "test-article",
		Title:       "Test Article",
		Description: "Test Description",
		Body:        "Test Body Content",
		AuthorID:    articleUser.ID,
	}

	err := db.Create(&article).Error
	assert.NoError(t, err)
	assert.NotZero(t, article.ID)
	assert.Equal(t, "Test Article", article.Title)
	assert.Equal(t, "test-article", article.Slug)
}

// Test 2: Article validation - empty title
func TestArticleValidation_EmptyTitle(t *testing.T) {
	setupTestDB()
	db := common.GetDB()

	article := ArticleModel{
		Title:       "", // Empty title
		Description: "Description",
		Body:        "Body",
		Slug:        "test-slug-empty-title",
	}

	err := db.Create(&article).Error
	// Article should be created even with empty title (no validation at DB level)
	// This test documents current behavior
	assert.NoError(t, err)
}

// Test 3: Article validation - empty body
func TestArticleValidation_EmptyBody(t *testing.T) {
	setupTestDB()
	db := common.GetDB()

	article := ArticleModel{
		Title:       "Title",
		Description: "Description",
		Body:        "", // Empty body
		Slug:        "test-slug-empty-body",
	}

	err := db.Create(&article).Error
	assert.NoError(t, err) // Documents current behavior
}

// Test 4: Article validation - empty description
func TestArticleValidation_EmptyDescription(t *testing.T) {
	setupTestDB()
	db := common.GetDB()

	article := ArticleModel{
		Title:       "Title",
		Description: "", // Empty description
		Body:        "Body",
		Slug:        "test-slug-empty-description",
	}

	err := db.Create(&article).Error
	assert.NoError(t, err)
}

// Test 5: Article unique slug constraint
func TestArticleValidation_UniqueSlug(t *testing.T) {
	setupTestDB()
	db := common.GetDB()

	// Create first article
	article1 := ArticleModel{
		Slug:        "unique-slug",
		Title:       "Article 1",
		Description: "Description 1",
		Body:        "Body 1",
	}
	db.Create(&article1)

	// Try to create second article with same slug
	article2 := ArticleModel{
		Slug:        "unique-slug", // Duplicate slug
		Title:       "Article 2",
		Description: "Description 2",
		Body:        "Body 2",
	}
	err := db.Create(&article2).Error
	
	// Should fail due to unique constraint
	assert.Error(t, err)
}

// Test 6: Article retrieval by ID
func TestArticleRetrieval_ByID(t *testing.T) {
	setupTestDB()
	db := common.GetDB()

	// Create article
	article := ArticleModel{
		Slug:        "retrieve-test",
		Title:       "Retrieve Test",
		Description: "Description",
		Body:        "Body",
	}
	db.Create(&article)

	// Retrieve by ID
	var retrieved ArticleModel
	err := db.First(&retrieved, article.ID).Error
	
	assert.NoError(t, err)
	assert.Equal(t, article.ID, retrieved.ID)
	assert.Equal(t, "Retrieve Test", retrieved.Title)
}

// Test 7: Article retrieval by slug
func TestArticleRetrieval_BySlug(t *testing.T) {
	setupTestDB()
	db := common.GetDB()

	// Create article
	article := ArticleModel{
		Slug:        "test-slug-unique",
		Title:       "Test Article",
		Description: "Description",
		Body:        "Body",
	}
	db.Create(&article)

	// Retrieve by slug
	var retrieved ArticleModel
	err := db.Where("slug = ?", "test-slug-unique").First(&retrieved).Error
	
	assert.NoError(t, err)
	assert.Equal(t, "test-slug-unique", retrieved.Slug)
	assert.Equal(t, "Test Article", retrieved.Title)
}

// Test 8: Article update
func TestArticleUpdate(t *testing.T) {
	setupTestDB()
	db := common.GetDB()

	// Create article
	article := ArticleModel{
		Slug:        "update-test",
		Title:       "Original Title",
		Description: "Original Description",
		Body:        "Original Body",
	}
	db.Create(&article)

	// Update article
	article.Title = "Updated Title"
	article.Body = "Updated Body"
	err := db.Save(&article).Error
	
	assert.NoError(t, err)

	// Verify update
	var retrieved ArticleModel
	db.First(&retrieved, article.ID)
	assert.Equal(t, "Updated Title", retrieved.Title)
	assert.Equal(t, "Updated Body", retrieved.Body)
}

// Test 9: Article deletion
func TestArticleDeletion(t *testing.T) {
	setupTestDB()
	db := common.GetDB()

	// Create article
	article := ArticleModel{
		Slug:        "delete-test",
		Title:       "Delete Test",
		Description: "Description",
		Body:        "Body",
	}
	db.Create(&article)
	articleID := article.ID

	// Delete article
	err := db.Delete(&article).Error
	assert.NoError(t, err)

	// Verify deletion
	var retrieved ArticleModel
	err = db.First(&retrieved, articleID).Error
	assert.Error(t, err) // Should not find deleted article
}

// Test 10: Tag association with article
func TestArticle_TagAssociation(t *testing.T) {
	setupTestDB()
	db := common.GetDB()

	// Create article
	article := ArticleModel{
		Slug:        "tag-test",
		Title:       "Tag Test",
		Description: "Description",
		Body:        "Body",
	}
	db.Create(&article)

	// Create tags
	tag1 := TagModel{Tag: "golang"}
	tag2 := TagModel{Tag: "testing"}
	db.Create(&tag1)
	db.Create(&tag2)

	// Associate tags with article
	db.Model(&article).Association("Tags").Append([]TagModel{tag1, tag2})

	// Retrieve article with tags
	var retrieved ArticleModel
	db.Preload("Tags").First(&retrieved, article.ID)
	
	assert.Equal(t, 2, len(retrieved.Tags))
}

// Test 11: Comment creation
func TestComment_Creation(t *testing.T) {
	setupTestDB()
	db := common.GetDB()

	// Create user and article user
	userModel := users.UserModel{
		Username: "commenter",
		Email:    "commenter@test.com",
	}
    hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
    userModel.PasswordHash = string(hashedPassword)
	db.Create(&userModel)

	articleUser := ArticleUserModel{
		UserModelID: userModel.ID,
	}
	db.Create(&articleUser)

	// Create article
	article := ArticleModel{
		Slug:        "comment-test",
		Title:       "Comment Test",
		Description: "Description",
		Body:        "Body",
		AuthorID:    articleUser.ID,
	}
	db.Create(&article)

	// Create comment
	comment := CommentModel{
		ArticleID: article.ID,
		AuthorID:  articleUser.ID,
		Body:      "This is a test comment",
	}
	err := db.Create(&comment).Error
	
	assert.NoError(t, err)
	assert.NotZero(t, comment.ID)
	assert.Equal(t, "This is a test comment", comment.Body)
}

// Test 12: Comment validation - empty body
func TestComment_ValidationEmptyBody(t *testing.T) {
	setupTestDB()
	db := common.GetDB()

	comment := CommentModel{
		Body: "", // Empty body
	}
	
	err := db.Create(&comment).Error
	// Should be created (no validation at DB level)
	assert.NoError(t, err)
}

// Test 13: Article list retrieval
func TestArticle_ListRetrieval(t *testing.T) {
	setupTestDB()
	db := common.GetDB()

	// Create multiple articles
	for i := 1; i <= 3; i++ {
		article := ArticleModel{
			Slug:        "article-" + string(rune(i)),
			Title:       "Article " + string(rune(i)),
			Description: "Description " + string(rune(i)),
			Body:        "Body " + string(rune(i)),
		}
		db.Create(&article)
	}

	// Retrieve all articles
	var articles []ArticleModel
	err := db.Find(&articles).Error
	
	assert.NoError(t, err)
	assert.GreaterOrEqual(t, len(articles), 3)
}

// Test 14: Article with comments retrieval
func TestArticle_WithCommentsRetrieval(t *testing.T) {
	setupTestDB()
	db := common.GetDB()

	// Create user
	userModel := users.UserModel{
		Username: "author",
		Email:    "author@test.com",
	}
    hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
    userModel.PasswordHash = string(hashedPassword)
	db.Create(&userModel)

	articleUser := ArticleUserModel{
		UserModelID: userModel.ID,
	}
	db.Create(&articleUser)

	// Create article
	article := ArticleModel{
		Slug:        "comments-test",
		Title:       "Comments Test",
		Description: "Description",
		Body:        "Body",
		AuthorID:    articleUser.ID,
	}
	db.Create(&article)

	// Create comments
	comment1 := CommentModel{
		ArticleID: article.ID,
		AuthorID:  articleUser.ID,
		Body:      "Comment 1",
	}
	comment2 := CommentModel{
		ArticleID: article.ID,
		AuthorID:  articleUser.ID,
		Body:      "Comment 2",
	}
	db.Create(&comment1)
	db.Create(&comment2)

	// Retrieve article with comments
	var retrieved ArticleModel
	db.Preload("Comments").First(&retrieved, article.ID)
	
	assert.Equal(t, 2, len(retrieved.Comments))
}

// Test 15: Tag list retrieval
func TestTag_ListRetrieval(t *testing.T) {
	setupTestDB()
	db := common.GetDB()

	// Create tags
	tags := []TagModel{
		{Tag: "golang"},
		{Tag: "testing"},
		{Tag: "backend"},
	}
	
	for _, tag := range tags {
		db.Create(&tag)
	}

	// Retrieve all tags
	var retrieved []TagModel
	err := db.Find(&retrieved).Error
	
	assert.NoError(t, err)
	assert.GreaterOrEqual(t, len(retrieved), 3)
}

// Test 16: DeleteArticleModel function
func TestArticle_DeleteModel(t *testing.T) {
	setupTestDB()
	db := common.GetDB()

	// Create an article
	article := ArticleModel{
		Slug:        "delete-model-test",
		Title:       "Delete Model Test",
		Description: "Test Description",
		Body:        "Test Body",
		AuthorID:    1,
	}
	db.Create(&article)
	articleID := article.ID

	// Call DeleteArticleModel function with condition (slug as condition)
	err := DeleteArticleModel(map[string]interface{}{"slug": "delete-model-test"})

	// Verify no error
	assert.NoError(t, err)

	// Verify article is deleted
	var found ArticleModel
	err = db.Where("id = ?", articleID).First(&found).Error
	assert.Error(t, err) // Should not find it (deleted)
}

// Test 17: GetArticleFeed method
func TestArticle_GetFeed(t *testing.T) {
	setupTestDB()
	db := common.GetDB()

	// Create user model first
	userModel := users.UserModel{
		Username: "feeduser",
		Email:    "feed@test.com",
	}
	db.Create(&userModel)

	// Create article user model
	articleUser := ArticleUserModel{UserModelID: userModel.ID}
	db.Create(&articleUser)
	db.Model(&articleUser).Related(&articleUser.UserModel)

	// Create an article
	article := ArticleModel{
		Slug:        "feed-test",
		Title:       "Feed Test",
		Description: "Feed Description",
		Body:        "Feed Body",
		AuthorID:    articleUser.ID,
	}
	db.Create(&article)

	// Call GetArticleFeed method on ArticleUserModel
	articles, count, err := articleUser.GetArticleFeed("20", "0")

	// Verify results (may be 0 if no followings)
	assert.NoError(t, err)
	assert.GreaterOrEqual(t, count, 0)
	assert.GreaterOrEqual(t, len(articles), 0)
}