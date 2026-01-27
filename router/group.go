package router

import (
	"log"
	"net/http"
	"time"

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

		g.POST("/add-music", h.AddMusicToGroup)
		g.POST("/remove-music", h.RemoveMusicFromGroup)
	}
}

func (h *GroupHandler) AddMusicToGroup(c *gin.Context) {
	var req handler.GroupMusicReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, tool.Response{Message: "参数错误", Body: err})
		return
	}

	if err := h.groupService.AddMusicToGroup(req.GroupID, req.MusicID); err != nil {
		c.JSON(http.StatusOK, tool.Response{Message: "添加失败", Body: err})
		return
	}

	c.JSON(http.StatusOK, tool.Response{Message: "添加成功"})
}

func (h *GroupHandler) RemoveMusicFromGroup(c *gin.Context) {
	var req handler.GroupMusicReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, tool.Response{Message: "参数错误", Body: err})
		return
	}

	if err := h.groupService.RemoveMusicFromGroup(req.GroupID, req.MusicID); err != nil {
		c.JSON(http.StatusOK, tool.Response{Message: "移除失败", Body: err})
		return
	}

	c.JSON(http.StatusOK, tool.Response{Message: "移除成功"})
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
	var req handler.ListGroupReq
	var condition filter.ListGroup
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("router: list group参数错误: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    err,
		})
		return
	}

	condition.Name = req.Name
	condition.Page = (req.Page - 1) * req.Size
	condition.Size = req.Size
	if req.StartTime > 0 {
		condition.StartTime = time.Unix(req.StartTime, 0)
	}
	if req.EndTime > 0 {
		condition.EndTime = time.Unix(req.EndTime, 0)
	} else {
		condition.EndTime = time.Now()
	}

	err, groups, total := h.groupService.ListGroup(&condition)
	if err != nil {
		log.Println("router: list group错误: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "获取列表失败",
			Body:    err,
		})
		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "获取成功",
		Body: gin.H{
			"data":  groups,
			"total": total,
		},
	})
}
func (h *GroupHandler) UpdateGroup(c *gin.Context) {
	var group model.Group
	if err := c.ShouldBindJSON(&group); err != nil {
		log.Println("router: update group参数错误: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    err,
		})
		return
	}

	err := h.groupService.UpdateGroup(&group)
	if err != nil {
		log.Println("router: update group错误: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "更新失败",
			Body:    err,
		})
		return
	}
	c.JSON(http.StatusOK, tool.Response{
		Message: "更新成功",
		Body:    group,
	})
}

func (h *GroupHandler) DeleteGroup(c *gin.Context) {
	var req handler.DeleteGroupReq
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("router: delete group参数错误: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    err,
		})
		return
	}

	err := h.groupService.DeleteGroup(&model.Group{ID: req.ID})
	if err != nil {
		log.Println("router: delete group错误: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "删除失败",
			Body:    err,
		})
		return
	}
	c.JSON(http.StatusOK, tool.Response{
		Message: "删除成功",
		Body:    req.ID,
	})
}
