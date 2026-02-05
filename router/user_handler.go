package router

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"music_system/model"
	"music_system/router/handler"
	"music_system/service"
	"music_system/tool"
)

type UserHandler struct {
	userService *service.UserService
}

func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

func (h *UserHandler) Init(engine *gin.Engine) {
	g := engine.Group("/user")
	{
		g.PUT("/update", h.Update)
		g.GET("/info", h.GetInfo)
	}
}

func (h *UserHandler) Update(c *gin.Context) {
	var req handler.UserUpdateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, tool.Response{Message: "参数错误", Body: err.Error()})
		return
	}

	// 验证是否是当前用户或管理员 (简单实现)
	// 在实际应用中，应该从 JWT token 中获取当前用户 ID

	user, err := h.userService.GetUserByID(req.ID)
	if err != nil {
		c.JSON(http.StatusNotFound, tool.Response{Message: "用户不存在"})
		return
	}

	if req.Nickname != "" {
		user.Nickname = req.Nickname
	}
	if req.Avatar != "" {
		user.Avatar = req.Avatar
	}

	err = h.userService.UpdateUser(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, tool.Response{Message: "更新失败", Body: err.Error()})
		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "更新成功",
		Body: handler.LoginResp{
			ID:       user.ID,
			Username: user.Username,
			Nickname: user.Nickname,
			Role:     user.Role,
			Avatar:   user.Avatar,
		},
	})
}

func (h *UserHandler) GetInfo(c *gin.Context) {
	id := c.Query("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, tool.Response{Message: "参数错误"})
		return
	}

	user, err := h.userService.GetUserByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, tool.Response{Message: "用户不存在"})
		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Body: handler.LoginResp{
			ID:       user.ID,
			Username: user.Username,
			Nickname: user.Nickname,
			Role:     user.Role,
			Avatar:   user.Avatar,
		},
	})
}
