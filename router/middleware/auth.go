package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"music_system/service"
	"music_system/tool"
)

func AuthMiddleware(authService *service.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Set("role", "guest")
			c.Next()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.JSON(http.StatusUnauthorized, tool.Response{Message: "Invalid Authorization header"})
			c.Abort()
			return
		}

		claims, err := authService.ParseToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, tool.Response{Message: "Invalid or expired token"})
			c.Abort()
			return
		}

		c.Set("userId", claims["id"])
		c.Set("username", claims["username"])
		c.Set("role", claims["role"])

		c.Next()
	}
}

func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role == "guest" {
			c.JSON(http.StatusForbidden, tool.Response{Message: "Registered users only"})
			c.Abort()
			return
		}
		c.Next()
	}
}
