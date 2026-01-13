package check

import (
	"errors"
	"log"
	"time"

	uuid "github.com/satori/go.uuid"

	"music_system/model"
	"music_system/router/handler"
	"music_system/tool/filter"
)

const (
	MAXSIZE = 999999
	MAXPAGE = 999999
)

func CheckFindMusicHistoryReq(req handler.FindMusicHistoryReq) (error, filter.FindMusicHistory) {
	var res filter.FindMusicHistory

	// start time end time
	if req.StartTime > req.EndTime {
		log.Println("CheckFindMusicHistoryReq: 起始时间大于结束时间 错误")
		return errors.New("起始时间大于结束时间"), res
	}
	if req.StartTime == 0 && req.EndTime == 0 {
		req.EndTime = time.Now().UnixMilli()
	}

	res = filter.FindMusicHistory{
		ID:        req.ID,
		MusicID:   req.MusicID,
		StartTime: req.StartTime,
		EndTime:   req.EndTime,
	}
	return nil, res
}

func CheckListMusicHistoryReq(req handler.ListMusicHistoryReq) (error, filter.ListMusicHistory) {
	var res filter.ListMusicHistory

	// start time end time
	if req.StartTime > req.EndTime {
		log.Println("起始时间大于结束时间 错误")
		return errors.New("起始时间大于结束时间"), res
	}
	if req.StartTime == 0 && req.EndTime == 0 {
		req.EndTime = time.Now().UnixMilli()
	}

	if req.Page < 1 {
		req.Page = 1
	}
	if req.Page > MAXPAGE {
		req.Page = MAXPAGE
	}
	if req.Size > MAXSIZE {
		req.Size = MAXSIZE
	}

	res = filter.ListMusicHistory{
		IDs:       req.IDs,
		MusicIDs:  req.MusicIDs,
		StartTime: req.StartTime,
		EndTime:   req.EndTime,
		Limit:     req.Size,
		Offset:    (req.Page - 1) * req.Size,
	}

	return nil, res
}

func CheckAddMusicHistoryReq(req handler.AddMusicHistoryReq) (error, model.MusicHistory) {
	var res model.MusicHistory

	// musicID必填
	if len(req.MusicID) == 0 {
		log.Println("musicID缺失")
		return errors.New("musicID缺失"), res
	}

	res = model.MusicHistory{
		ID:         uuid.NewV4().String(),
		MusicID:    req.MusicID,
		CreateTime: time.Now(),
		UpdateTime: time.Now(),
	}

	return nil, res
}

func CheckUpdateMusicHistoryReq(req *handler.UpdateMusicHistoryReq) (error, model.MusicHistory) {
	var res model.MusicHistory

	if len(req.ID) == 0 {
		log.Println("ID缺失")
		return errors.New("ID缺失"), res
	}

	res = model.MusicHistory{
		ID:      req.ID,
		MusicID: req.MusicID,
	}

	return nil, res
}

func CheckDeleteMusicHistoryReq(req handler.DeleteMusicHistoryReq) (error, filter.DeleteMusicHistory) {
	var res filter.DeleteMusicHistory

	if len(req.ID) == 0 {
		return errors.New("id不能为空"), res
	}

	res = filter.DeleteMusicHistory{
		ID: req.ID,
	}
	return nil, res
}
