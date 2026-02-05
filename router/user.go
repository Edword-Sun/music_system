package router

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"music_system/router/handler"
	"music_system/service"
	"music_system/tool"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

func (h *AuthHandler) Init(engine *gin.Engine) {
	g := engine.Group("/auth")
	{
		g.POST("/register", h.Register)
		g.POST("/login", h.Login)
		g.POST("/guest", h.GuestLogin)
	}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req handler.RegisterReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, tool.Response{Message: "参数错误", Body: err.Error()})
		return
	}

	err := h.authService.Register(req.Username, req.Password, req.Nickname)
	if err != nil {
		c.JSON(http.StatusBadRequest, tool.Response{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, tool.Response{Message: "注册成功"})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req handler.LoginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, tool.Response{Message: "参数错误", Body: err.Error()})
		return
	}

	token, user, err := h.authService.Login(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, tool.Response{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "登录成功",
		Body: handler.LoginResp{
			Token:    token,
			ID:       user.ID,
			Username: user.Username,
			Nickname: user.Nickname,
			Role:     user.Role,
			Avatar:   user.Avatar,
		},
	})
}

func (h *AuthHandler) GuestLogin(c *gin.Context) {
	token, user, err := h.authService.GuestLogin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, tool.Response{Message: "系统错误"})
		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "游客登录成功",
		Body: handler.LoginResp{
			Token:    token,
			ID:       user.ID,
			Username: user.Username,
			Nickname: user.Nickname,
			Role:     user.Role,
			Avatar:   user.Avatar,
		},
	})
}
