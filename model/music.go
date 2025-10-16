package model

import (
	"gorm.io/gorm"
	"time"
)

type Music struct {
	ID          string `gorm:"primarykey type:text;default:(UUID())" json:"id"`
	Title       string `gorm:"type:text" json:"title"`       // 标题
	Description string `gorm:"type:text" json:"description"` // 详情
	Content     string `gorm:"type:text" json:"content"`     // 音乐本体
	PlayTime    string `gorm:"type:text" json:"play_time"`   // 音乐时长
	// singer
	SingerName string `gorm:"type:text" json:"singer_name"` // 音乐主唱人

	CreateTime time.Time `gorm:"type:DATETIME with time zone;not null" json:"create_time"`
	UpdateTime time.Time `gorm:"type:DATETIME with time zone;not null" json:"update_time"`
}

func (m *Music) TableName() string {
	return "music"
}

func (m *Music) BeforeCreate(tx *gorm.DB) (err error) {
	m.CreateTime = time.Now()
	m.UpdateTime = time.Now()
	return nil
}

func (m *Music) BeforeUpdate(tx *gorm.DB) (err error) {
	m.UpdateTime = time.Now()
	return nil
}
