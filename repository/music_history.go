package repository

import (
	"errors"
	"log"
	"time"

	"gorm.io/gorm"

	"music_system/model"
	"music_system/tool/filter"
)

type MusicHistoryRepository struct {
	db *gorm.DB
}

func NewMusicHistoryRepository(db *gorm.DB) *MusicHistoryRepository {
	return &MusicHistoryRepository{
		db: db,
	}
}

func (repo *MusicHistoryRepository) CreateMusicHistory(musicHistory *model.MusicHistory) error {
	query := repo.db.Model(musicHistory)
	err := query.Create(musicHistory).Error
	if err != nil {
		log.Printf("error: %v", err)
		return errors.New("内部错误")
	}

	return nil
}

func (repo *MusicHistoryRepository) FindMusicHistory(findMusicHistory filter.FindMusicHistory) (error, []*model.MusicHistory) {
	var data []*model.MusicHistory
	query := repo.db.Model(&model.MusicHistory{}).Order("create_time DESC")

	if len(findMusicHistory.ID) > 0 {
		query = query.Where("id = ?", findMusicHistory.ID)
	}
	if len(findMusicHistory.UserID) > 0 {
		query = query.Where("user_id = ?", findMusicHistory.UserID)
	}
	if len(findMusicHistory.MusicID) > 0 {
		query = query.Where("music_id = ?", findMusicHistory.MusicID)
	}

	// todo 时间的检验方法还要再看
	if findMusicHistory.EndTime > 0 && findMusicHistory.StartTime > 0 {
		query = query.Where("create_time > ?", time.UnixMilli(findMusicHistory.StartTime))
		query = query.Where("create_time < ?", time.UnixMilli(findMusicHistory.EndTime))
	}

	err := query.Find(&data).Error
	if err != nil {
		log.Printf("err: %v", err)
		return errors.New("内部错误"), nil
	}
	if len(data) == 0 {
		return gorm.ErrRecordNotFound, nil // 或自定义 "未找到"
	}

	return nil, data

}

func (repo *MusicHistoryRepository) UpdateMusicHistory(musicHistory *model.MusicHistory) error {
	if musicHistory == nil {
		log.Println("error: 空指针 music_history")
		return errors.New("空指针 music_history")
	}
	if len(musicHistory.ID) == 0 {
		log.Println("更新失败：必须提供 ID")
		return errors.New("更新失败：必须提供 ID")
	}

	query := repo.db.Model(musicHistory)
	query = query.Where("id = ?", musicHistory.ID)

	err := query.Updates(musicHistory).Error
	if err != nil {
		log.Println("error: 更新music_history错误")
		return errors.New("内部错误")
	}

	return nil
}

func (repo *MusicHistoryRepository) DeleteMusicHistory(deleteMusicHistory filter.DeleteMusicHistory) error {
	if len(deleteMusicHistory.ID) == 0 {
		log.Println("删除失败：必须提供有效的 ID")
		return errors.New("删除失败：必须提供有效的 ID")
	}

	query := repo.db.Model(&model.MusicHistory{})
	query = query.Where("id = ?", deleteMusicHistory.ID)

	err := query.Delete(&model.MusicHistory{}).Error
	if err != nil {
		log.Println("err: 删除music_history错误")
		return errors.New("内部错误")
	}

	// 可选：记录日志，如果没删除任何记录
	if query.RowsAffected == 0 {
		// 不返回 error，但可以 log 一下
		log.Printf("警告: 未找到 ID 为 %s 的 music_history 记录", deleteMusicHistory.ID)
		// 如果业务需要严格模式，这里可以返回 errors.New("未找到匹配的 Comment 记录")
	}

	return nil
}
