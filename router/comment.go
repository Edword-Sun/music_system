package router

import (
	"github.com/gin-gonic/gin"

	"music_system/service"
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
