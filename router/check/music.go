package check

import (
	"log"

	"music_system/model"
	"music_system/router/handler"
)

func CheckDeleteMusic(req *handler.DeleteMusicReq) (error, model.Music) {
	var res model.Music

	if len(req.ID) == 0 {
		log.Println("id 不能为空")
		return nil, model.Music{}
	}

	res = model.Music{
		ID: req.ID,
	}

	return nil, res
}
