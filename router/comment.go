package router

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"

	"music_system/model"
	"music_system/service"
	"music_system/tool"
	"music_system/tool/filter"
)

type CommentHandler struct {
	commentService *service.CommentService
}

func NewCommentHandler(commentService *service.CommentService) *CommentHandler {
	return &CommentHandler{
		commentService: commentService,
	}
}

func (h *CommentHandler) Init(engine *gin.Engine) {
	g := engine.Group("/comment")
	{
		g.POST("", h.FindComment)
		g.POST("", h.CreateComment)
		g.PUT("", h.UpdateComment)
		g.DELETE("", h.DeleteComment)
	}
}

func (h *CommentHandler) CreateComment(c *gin.Context) {
	var comment model.Comment
	err := c.ShouldBindJSON(&comment)
	if err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})

		return
	}

	comment.ID = uuid.NewV4().String()
	err = h.commentService.CreateComment(&comment)
	if err != nil {
		log.Println("err: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "创建comment错误",
			Body:    nil,
		})

		return
	}

	log.Println("创建comment成功")
	c.JSON(http.StatusOK, tool.Response{
		Message: "创建comment成功",
		Body: gin.H{
			"id": comment.ID,
		},
	})
}

func (h *CommentHandler) FindComment(c *gin.Context) {
	var condition filter.FindComment
	err := c.ShouldBindJSON(&condition)
	if err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})

		return
	}

	var data []*model.Comment
	err, data = h.commentService.FindComment(condition)
	if err != nil {
		log.Println("err: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "查找comment错误",
			Body:    nil,
		})

		return
	}

	log.Println("查找comment成功")
	c.JSON(http.StatusOK, tool.Response{
		Message: "查找comment成功",
		Body:    data,
	})
}

func (h *CommentHandler) UpdateComment(c *gin.Context) {
	var data model.Comment
	err := c.ShouldBindJSON(&data)
	if err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})

		return
	}

	err = h.commentService.UpdateComment(&data)
	if err != nil {
		log.Println("err: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "更新comment错误",
			Body:    nil,
		})

		return
	}

	log.Println("更新comment成功")
	c.JSON(http.StatusOK, tool.Response{
		Message: "更新comment成功",
		Body:    nil,
	})
}
func (h *CommentHandler) DeleteComment(c *gin.Context) {
	var condition filter.DeleteComment
	err := c.ShouldBindJSON(&condition)
	if err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})

		return
	}

	err = h.commentService.DeleteComment(condition)
	if err != nil {
		log.Println("err: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "删除comment错误",
			Body:    nil,
		})

		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "删除comment成功",
		Body:    nil,
	})
}
