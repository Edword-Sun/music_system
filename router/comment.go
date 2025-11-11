package router

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"music_system/model"
	"music_system/router/check"
	"music_system/router/handler"
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
		g.POST("", h.CreateComment)

		g.POST("/find", h.FindComment)
		g.POST("/list", h.ListComment)

		g.PUT("", h.UpdateComment)
		g.DELETE("", h.DeleteComment)
	}
}

func (h *CommentHandler) CreateComment(c *gin.Context) {
	var req handler.CreateCommentReq
	var resp handler.CreateCommentResp

	log.Println("create comment 接受参数中")
	err := c.ShouldBindJSON(&req)
	log.Println("create comment 接受参数完")
	if err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})

		return
	}

	var comment model.Comment
	log.Println("create comment 校验参数中")
	err, comment = check.CheckCreateCommentReq(&req)
	log.Println("create comment 校验参数完")

	if err != nil {
		log.Println("CreateComment:校验参数失败: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body: gin.H{
				"err": err.Error(),
			},
		})

		return
	}

	log.Println("create comment 创建comment中")
	err = h.commentService.CreateComment(&comment)
	log.Println("create comment 创建comment完")

	if err != nil {
		log.Println("CreateComment:创建comment错误: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "创建comment错误",
			Body:    nil,
		})

		return
	}

	resp.ID = comment.ID
	c.JSON(http.StatusOK, tool.Response{
		Message: "创建comment成功",
		Body: gin.H{
			"id": comment.ID,
		},
	})
	log.Println("create comment 创建comment成功")
}

func (h *CommentHandler) FindComment(c *gin.Context) {
	var req handler.FindCommentReq
	var resp handler.FindCommentResp

	var condition filter.FindComment
	err := c.ShouldBindJSON(&req)
	if err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})

		return
	}

	err, condition = check.CheckFindComment(&req)
	if err != nil {
		log.Println("校验参数错误: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body: gin.H{
				"err": err.Error(),
			},
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

	resp.Data = data
	log.Println("查找comment成功")
	c.JSON(http.StatusOK, tool.Response{
		Message: "查找comment成功",
		Body:    resp.Data,
	})
}

func (h *CommentHandler) ListComment(c *gin.Context) {
	var req handler.ListCommentReq
	var resp handler.ListCommentResp
	var condition filter.FindCommentWithPagination

	log.Println("list comment 接受参数中")

	err := c.ShouldBindJSON(&req)

	log.Println("list comment 接受参数")

	if err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})
		return
	}

	log.Println("list comment 校验参数中")

	err, condition = check.CheckListCommentReq(&req)

	log.Println("list comment 校验参数结束")

	if err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body: gin.H{
				"error": err.Error(),
			},
		})
		return
	}

	log.Println("router:ListComment service:ListComment中")

	err, resp.Data, resp.Total = h.commentService.ListComment(condition)

	log.Println("router:ListComment service:ListComment结束")

	if err != nil {
		log.Println("list comment错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "list comment错误",
			Body: gin.H{
				"err": err,
			},
		})
		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "成功",
		Body: gin.H{
			"total": resp.Total,
			"data":  resp.Data,
		},
	})

	log.Println("list comment 完成")
	return
}

func (h *CommentHandler) UpdateComment(c *gin.Context) {
	var req handler.UpdateCommentReq
	//var resp handler.UpdateCommentResp
	var data model.Comment
	err := c.ShouldBindJSON(&req)
	if err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})

		return
	}

	err, data = check.CheckUpdateComment(&req)
	if err != nil {
		log.Println("err: ", err)
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
	var req handler.DeleteCommentReq
	//var resp handler.DeleteCommentResp
	var condition filter.DeleteComment
	err := c.ShouldBindJSON(&req)
	if err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})

		return
	}

	err, condition = check.CheckDeleteComment(&req)
	if err != nil {
		log.Println("err: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "校验参数错误",
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
