package repository

import (
	"errors"
	"log"
	"time"

	"gorm.io/gorm"

	"music_system/model"
	"music_system/tool/filter"
)

type UserActionPropertiesRepository struct {
	db *gorm.DB
}

func NewUserActionProperties(db *gorm.DB) *UserActionPropertiesRepository {
	return &UserActionPropertiesRepository{
		db: db,
	}
}

func (repo *UserActionPropertiesRepository) Create(UAP *model.UserActionProperties) error {
	query := repo.db.Model(UAP)
	err := query.Create(UAP).Error
	if err != nil {
		log.Printf("error: %v", err)
		return errors.New("内部错误")
	}

	return nil
}

func (repo *UserActionPropertiesRepository) Find(findUAP filter.FindUserActionProperties) (error, []*model.UserActionProperties) {
	var data []*model.UserActionProperties
	query := repo.db.Model(&model.UserActionProperties{})

	if len(findUAP.ID) > 0 {
		query = query.Where("id = ?", findUAP.ID)
	}
	if len(findUAP.UserID) > 0 {
		query = query.Where("user_id = ?", findUAP.UserID)
	}
	if len(findUAP.MusicID) > 0 {
		query = query.Where("music_id = ?", findUAP.MusicID)
	}
	if findUAP.IsActiveThumb {
		query = query.Where("thumb = ?", findUAP.Thumb)
	}
	if findUAP.IsActiveUnThumb {
		query = query.Where("un_thumb = ?", findUAP.UnThumb)
	}
	if findUAP.IsActiveCollected {
		query = query.Where("collected = ?", findUAP.Collected)
	}
	if findUAP.IsActiveShare {
		query = query.Where("share = ?", findUAP.Share)
	}

	// todo 时间的检验方法还要再看
	if findUAP.EndTime > 0 && findUAP.StartTime > 0 {
		query = query.Where("create_time > ?", time.UnixMilli(findUAP.StartTime))
		query = query.Where("create_time < ?", time.UnixMilli(findUAP.EndTime))
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

func (repo *UserActionPropertiesRepository) Update(UAP *model.UserActionProperties) error {
	if UAP == nil {
		log.Println("error: 空指针 user_action_properties")
		return errors.New("空指针 user_action_properties")
	}
	if len(UAP.ID) == 0 {
		log.Println("更新失败：必须提供 ID")
		return errors.New("更新失败：必须提供 ID")
	}

	query := repo.db.Model(UAP)
	query = query.Where("id = ?", UAP.ID)

	err := query.Updates(UAP).Error
	if err != nil {
		log.Println("error: 更新user_action_properties错误")
		return errors.New("内部错误")
	}

	return nil
}

func (repo *UserActionPropertiesRepository) Delete(deleteUAP filter.DeleteUserActionProperties) error {
	if len(deleteUAP.ID) == 0 {
		log.Println("删除失败：必须提供有效的 ID")
		return errors.New("删除失败：必须提供有效的 ID")
	}

	query := repo.db.Model(&model.UserActionProperties{})
	query = query.Where("id = ?", deleteUAP.ID)

	err := query.Delete(&model.UserActionProperties{}).Error
	if err != nil {
		log.Println("err: 删除user_action_properties错误")
		return errors.New("内部错误")
	}

	// 可选：记录日志，如果没删除任何记录
	if query.RowsAffected == 0 {
		// 不返回 error，但可以 log 一下
		log.Printf("警告: 未找到 ID 为 %s 的 user_action_properties 记录", deleteUAP.ID)
		// 如果业务需要严格模式，这里可以返回 errors.New("未找到匹配的 Comment 记录")
	}

	return nil
}
