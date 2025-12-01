package router

import (
	"log"

	"github.com/gin-gonic/gin"

	"music_system/router/check"
	"music_system/router/handler"
	"music_system/service"
	"music_system/tool"
)

type MusicHistoryHandler struct {
	MusicHistoryService *service.MusicHistoryService
}

func NewMusicHistoryHandler(MHSvc *service.MusicHistoryService) *MusicHistoryHandler {
	return &MusicHistoryHandler{
		MusicHistoryService: MHSvc,
	}
}

func (h *MusicHistoryHandler) Init(engin *gin.Engine) {
	g := engin.Group("/mh")
	{

		g.POST("/get", h.FindMusicHistory)
		g.POST("/list", h.ListMusicHistory)

		g.POST("/add", h.AddMusicHistory)

		g.PUT("/update", h.UpdateMusicHistory)

		g.POST("/delete", h.DeleteMusicHistory)

	}
}

func (h *MusicHistoryHandler) FindMusicHistory(c *gin.Context) {
	var req handler.FindMusicHistoryReq
	var resp handler.FindMusicHistoryResp

	if err := c.ShouldBindQuery(&req); err != nil {
		log.Println("参数错误: ", err)
		c.JSON(200, tool.Response{
			Message: "参数错误",
			Body: gin.H{
				"error": err.Error(),
			},
		})

		return
	}

	err, condition := check.CheckFindMusicHistoryReq(req)
	if err != nil {
		log.Println("参数错误: ", err)
		c.JSON(200, tool.Response{
			Message: "参数错误",
			Body:    err,
		})

		return
	}

	err, data := h.MusicHistoryService.FindMusicHistory(condition)
	if err != nil {
		log.Println("查询错误: ", err)
		c.JSON(200, tool.Response{
			Message: "查询错误",
			Body:    err,
		})

		return
	}
	resp.Data = data

	log.Println("查询完成")
	c.JSON(200, tool.Response{
		Message: "查询成功",
		Body:    resp,
	})
	return
}
func (h *MusicHistoryHandler) ListMusicHistory(c *gin.Context) {
	var req handler.ListMusicHistoryReq
	var resp handler.ListMusicHistoryResp

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("参数错误")
		c.JSON(200, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})

		return
	}

	err, condition := check.CheckListMusicHistoryReq(req)
	if err != nil {
		log.Println("参数错误")
		c.JSON(200, tool.Response{
			Message: "参数错误",
			Body:    err,
		})

		return
	}

	err, data, total := h.MusicHistoryService.ListMusicHistory(condition)
	if err != nil {
		log.Println("list查找错误: ", err)
		c.JSON(200, tool.Response{
			Message: "list查找错误",
			Body:    err,
		})

		return
	}

	resp.Data = data
	resp.Total = total

	log.Println("list查找成功")
	c.JSON(200, tool.Response{
		Message: "",
		Body:    resp,
	})

	return
}
func (h *MusicHistoryHandler) AddMusicHistory(c *gin.Context) {
	var req handler.AddMusicHistoryReq
	var resp handler.AddMusicHistoryResp

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("参数错误")
		c.JSON(200, tool.Response{
			Message: "参数错误",
			Body:    err,
		})
		return
	}

	err, mh := check.CheckAddMusicHistoryReq(req)
	if err != nil {
		log.Println("参数校验错误: ", err)
		c.JSON(200, tool.Response{
			Message: "参数校验错误",
			Body:    err,
		})
		return
	}

	err = h.MusicHistoryService.CreateMusicHistory(&mh)
	if err != nil {
		log.Println("添加错误: ", err)
		c.JSON(200, tool.Response{
			Message: "添加错误",
			Body:    err,
		})
		return
	}

	resp.ID = mh.ID
	log.Println("mh添加成功")
	c.JSON(200, tool.Response{
		Message: "添加成功",
		Body:    resp,
	})

	return
}
func (h *MusicHistoryHandler) UpdateMusicHistory(c *gin.Context) {
	var req handler.UpdateMusicHistoryReq
	//var resp handler.UpdateMusicHistoryResp

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("参数错误")
		c.JSON(200, tool.Response{
			Message: "参数错误",
			Body:    err,
		})
		return
	}

	err, mh := check.CheckUpdateMusicHistoryReq(&req)
	if err != nil {
		log.Println("参数校验错误: ", err)
		c.JSON(200, tool.Response{
			Message: "参数校验错误",
			Body:    err,
		})
		return
	}

	err = h.MusicHistoryService.UpdateMusicHistory(&mh)
	if err != nil {
		log.Println("修改错误: ", err)
		c.JSON(200, tool.Response{
			Message: "修改错误",
			Body:    err,
		})
		return
	}

	c.JSON(200, tool.Response{
		Message: "修改成功",
		Body:    nil,
	})
	return
}
func (h *MusicHistoryHandler) DeleteMusicHistory(c *gin.Context) {
	var req handler.DeleteMusicHistoryReq
	var resp handler.DeleteMusicResp

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("参数错误")
		c.JSON(200, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})
		return
	}

	err, condition := check.CheckDeleteMusicHistoryReq(req)
	if err != nil {
		log.Println("参数校验错误")
		c.JSON(200, tool.Response{
			Message: "参数校验错误",
			Body:    nil,
		})
		return
	}

	err = h.MusicHistoryService.DeleteMusicHistory(condition)
	if err != nil {
		log.Println("删除错误")
		c.JSON(200, tool.Response{
			Message: "删除错误",
			Body:    nil,
		})
		return
	}

	log.Println("删除成功")
	c.JSON(200, tool.Response{
		Message: "删除成功",
		Body:    resp,
	})
	return
}
