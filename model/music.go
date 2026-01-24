package model

import (
	"time"

	"gorm.io/gorm"
)

type Music struct {
	ID         string `gorm:"primarykey type:text;default:(UUID())" json:"id"`
	SingerName string `gorm:"type:text" json:"singer_name"`
	Name       string `gorm:"type:text" json:"name"`
	Album      string `gorm:"type:text" json:"album"`
	Band       string `gorm:"type:text" json:"band"`

	StreamerID string `gorm:"type:text" json:"streamer_id"`

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
