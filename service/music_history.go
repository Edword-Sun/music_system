package service

import (
	"music_system/repository"
)

type MusicHistoryService struct {
	MusicHistoryRepository *repository.MusicHistoryRepository
}

func NewMusicHistoryService(MHRepo *repository.MusicHistoryRepository) *MusicHistoryService {
	return &MusicHistoryService{
		MusicHistoryRepository: MHRepo,
	}
}
