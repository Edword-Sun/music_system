package router

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"music_system/service"
	"music_system/tool"
)

type CommentHandler struct {
	commentService *service.CommentService
}

func NewCommentHandler(commentService *service.CommentService) *CommentHandler {
	return &CommentHandler{
		commentService: commentService,
	}
}

func (h *CommentHandler) Init(g *gin.Engine) {
	g.Group("comment")
	{
		g.GET("")
		g.POST("")
		g.PUT("")
		g.DELETE("")
	}
}

func (h *CommentHandler) CreateComment(c *gin.Context) {
	c.JSON(http.StatusOK, tool.Response{
		Message: "",
		Body:    nil,
	})
}
func (h *CommentHandler) FindComment(c *gin.Context) {
	c.JSON(http.StatusOK, tool.Response{
		Message: "",
		Body:    nil,
	})
}
func (h *CommentHandler) UpdateComment(c *gin.Context) {
	c.JSON(http.StatusOK, tool.Response{
		Message: "",
		Body:    nil,
	})
}
func (h *CommentHandler) DeleteComment(c *gin.Context) {
	c.JSON(http.StatusOK, tool.Response{
		Message: "",
		Body:    nil,
	})
}
