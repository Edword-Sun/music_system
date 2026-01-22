package main

import (
	"os"

	"github.com/gin-gonic/gin"

	"music_system/config"
	"music_system/repository"
	"music_system/router"
	"music_system/service"
	"music_system/tool/music_storage_path"
)

func main() {
	// 确保目录存在（可选）
	if err := os.MkdirAll(music_storage_path.MusicRoot, 0755); err != nil {
		panic("Failed to create music directory: " + err.Error())
	}

	// Initialize database connection
	config.InitDB()

	r := gin.Default()

	// Initialize repository
	musicRepo := repository.NewMusicRepository(config.DB)
	streamerRepo := repository.NewStreamerRepository(config.DB)
	musicHistoryRepository := repository.NewMusicHistoryRepository(config.DB)
	groupRepository := repository.NewGroupRepository(config.DB)

	// Initialize services
	musicService := service.NewMusicService(musicRepo)
	streamerService := service.NewStreamerService(streamerRepo)
	musicHistoryService := service.NewMusicHistoryService(musicHistoryRepository)
	groupService := service.NewGroupService(groupRepository)

	// Initialize handlers and register routes
	healthHandler := router.NewHealthHandler()

	musicHandler := router.NewMusicHandler(musicService, streamerService)
	streamerHandler := router.NewStreamerHandler(streamerService)
	musicHistoryHandler := router.NewMusicHistoryHandler(musicHistoryService)
	groupHandler := router.NewGroupHandler(groupService)

	healthHandler.Init(r)
	musicHandler.Init(r)
	streamerHandler.Init(r)
	musicHistoryHandler.Init(r)
	groupHandler.Init(r)

	r.Run(":8080") // listen and serve on 0.0.0.0:8080
}
