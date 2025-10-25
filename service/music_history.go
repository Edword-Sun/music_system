package service

import (
	"log"

	"music_system/model"
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

func (svc *MusicHistoryService) CreateMusicHistory(mh *model.MusicHistory) error {
	err := svc.MusicHistoryRepository.CreateMusicHistory(mh)
	if err != nil {
		log.Println("err: ", err.Error())
		return err
	}

	return nil
}
