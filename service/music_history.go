package service

import (
	"log"

	"music_system/model"
	"music_system/repository"
	"music_system/tool/filter"
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

func (svc *MusicHistoryService) FindMusicHistory(condition filter.FindMusicHistory) (error, []*model.MusicHistory) {
	log.Println("implement!!!")
	return nil, nil
}
func (svc *MusicHistoryService) ListMusicHistory(condition filter.ListMusicHistory) (error, []*model.MusicHistory, int64) {
	log.Println("implement!!!")
	return nil, nil, 0
}
func (svc *MusicHistoryService) UpdateMusicHistory(mh *model.MusicHistory) error {
	log.Println("implement!!!")
	return nil
}
func (svc *MusicHistoryService) DeleteMusicHistory(condition filter.DeleteMusicHistory) error {
	log.Println("implement!!!")
	return nil
}
