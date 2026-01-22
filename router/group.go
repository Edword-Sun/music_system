package router

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"

	"music_system/model"
	"music_system/router/handler"
	"music_system/service"
	"music_system/tool"
	"music_system/tool/filter"
)

type GroupHandler struct {
	groupService *service.GroupService
}

func NewGroupHandler(svc *service.GroupService) *GroupHandler {
	return &GroupHandler{
		groupService: svc,
	}
}

func (h *GroupHandler) Init(r *gin.Engine) {
	g := r.Group("/group")
	{
		g.POST("/add", h.CreateGroup)
		g.POST("/find", h.FindGroup)
		g.POST("/list", h.ListGroup)

		g.POST("/update", h.UpdateGroup)
		g.DELETE("/delete", h.DeleteGroup)
	}
}

func (h *GroupHandler) CreateGroup(c *gin.Context) {
	var group model.Group
	if err := c.ShouldBindJSON(&group); err != nil {
		log.Println("router: create group参数错误: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    err,
		})
		return
	}

	group.ID = uuid.NewV4().String()
	err := h.groupService.CreateGroup(&group)
	if err != nil {
		log.Println("router: create group错误: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "创建失败",
			Body:    err,
		})
		return
	}
	c.JSON(http.StatusOK, tool.Response{
		Message: "创建成功",
		Body:    group,
	})

	return
}

func (h *GroupHandler) FindGroup(c *gin.Context) {
	var req handler.FindGroupReq
	var condition filter.FindGroup
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("router: find group参数错误: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    err,
		})
		return
	}

	condition.ID = req.ID
	condition.Name = req.Name
	condition.MusicIDs = req.MusicIDs

	group, err := h.groupService.FindGroup(&condition)
	if err != nil {
		log.Println("router: find group错误: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "查询失败",
			Body:    err,
		})
		return
	}
	c.JSON(http.StatusOK, tool.Response{
		Message: "查询成功",
		Body:    group,
	})

}

func (h *GroupHandler) ListGroup(c *gin.Context) {
	log.Println("implement")
}
func (h *GroupHandler) UpdateGroup(c *gin.Context) {
	log.Println("implement")
}

func (h *GroupHandler) DeleteGroup(c *gin.Context) {
	log.Println("implement")
}
