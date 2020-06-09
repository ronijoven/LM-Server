const getJoinTableData = (req, res, db, dbname) => {
  var reqData  = req.query;
  var dbtojoin = reqData.dbtojoin;
  var coltojoin = reqData.coltojoin;
  var coltosort = reqData.coltosort || "id";
  var coltomatch = reqData.coltomatch;
  var page = reqData.page || 1  
  let query = db
    .select('*')
    .from(dbname)
    .leftJoin(dbtojoin, coltojoin, coltomatch )
    .orderBy(coltosort);

  if (reqData.limit>0) {
    var limit = reqData.limit || 0
    if (page < 1) page = 1;
    var offset = reqData.limit ? (page - 1) * limit : 0;
    query
    .limit(limit)
    .offset(offset);
  }
  return query
    .then(items => {
      if(items.length){
        res.json(items)
      } else {
        res.json({dataExists: 'false'})
      }
    })
    .catch(err => res.status(400).json({
      error: err,
      dbError: 'db error (get all data)'}))
}
  
const getTableData = (req, res, db) => {
  var reqData  = req.query;
  var dbname = reqData.dbname;
  //console.log("reqData",reqData);
  let query = db
    .select('*')
    .from(dbname);

  if (reqData.col && reqData.val && reqData.model) {
    var col = reqData.col;
    var val = reqData.val;  
    var model = reqData.model;
    if ( model==="firstchar") {  
      var coloth = reqData.coloth;
      var valoth = reqData.valoth;
      var newcolstr = "left("+coloth+",1)";
      query.where(col,val); 
      if ( valoth === "Num") {  
        var arrstr = 
        query.whereRaw("left(title,1) IN ('0','1','2','3','4','5','6','7','8','9')");
      } else {
        query.whereRaw("left(title,1) = ?",valoth);
      }  
    } else {
      query.where(col,val);
    }      
  } else if (reqData.col && reqData.val){
    var col = reqData.col;
    var val = reqData.val;  
    query.where(col,val);
  };
  if (reqData.title && reqData.singer) {
    var arrtitle = JSON.parse(reqData.title);
    var arrsinger = JSON.parse(reqData.singer);
    var title = arrtitle.value.toUpperCase();
    var singer = arrsinger.value.toUpperCase();  
    var varcol = "";
    if (title !== "" && singer !== "") { 
      console.log("title not empty, singer not empty");
      varcol = "%"+title+"%";
      query.whereRaw('upper(title) like ?', [varcol]); 
      varcol = "%"+singer+"%";
      query.whereRaw('upper(singer) like ?', [varcol]); 
    }
    if (title !== "" && singer === "") {
      varcol = "%"+title+"%";
      query.whereRaw('upper(title) like ?', [varcol]); 
    }
    if (title === "" && singer !== "") {
      varcol = "%"+singer+"%";
      query.whereRaw('upper(singer) like ?', [varcol]); 
    }
  }
  if (reqData.sortkey) {
    query.orderBy(reqData.sortkey);    
  }
  if (reqData.limit && reqData.limit > 0) {
    var page = reqData.page || 1 ;
    var limit = reqData.limit || 0 ;
    if (page < 1) page = 1;
    var offset = reqData.limit ? (page - 1) * limit : 0;
    query
    .limit(limit)
    .offset(offset);
  }

  return query
    .then(items => {
      if(items.length){
        res.json({
          dataExists: true,
          items:items})
      } else {
        res.json({
          dataExists: 'false',
          items:[]})
      }
    })
    .catch(err => res.status(400).json({
      error: err,
      dbError: 'db error (get all data)'})
    )
}

const getTableWhereData = (req, res, db) => {
  var reqData  = req.query;
  var dbname = reqData.dbname || "user";
  var col = reqData.col || "id";
  var val = reqData.val || 1;
  db(dbname)
    .select()
    .where(col,val)
    .then(items => {
      if(items.length){
        res.json(items)
      } else {
        res.json({items:[], dataExists: 'false'})
      }
    })
    .catch(err => res.status(400).json({
      dbError: 'db error (get select by column data)'})
    )
}

const getPagingTableData = (req, res, db) => {
  var reqData  = req.query;
  var dbname = reqData.dbname;
  console.log("reqData",reqData);
  let query = db
    .count()
    .from(dbname);

  if (reqData.col && reqData.val && reqData.model) {
    var col = reqData.col;
    var val = reqData.val;  
    var model = reqData.model;
    if ( model==="firstchar") {  
      var coloth = reqData.coloth;
      var valoth = reqData.valoth;
      var newcolstr = "left("+coloth+",1)";
      query.where(col,val); 
      if ( valoth === "Num") {  
        var arrstr = 
        query.whereRaw("left(title,1) IN ('0','1','2','3','4','5','6','7','8','9')");
      } else {
        query.whereRaw("left(title,1) = ?",valoth);
      }  
    } else {
      query.where(col,val);
    }      
  } else if (reqData.col && reqData.val){
    var col = reqData.col;
    var val = reqData.val;  
    query.where(col,val);
  };
  if (reqData.title && reqData.singer) {
    var arrtitle = JSON.parse(reqData.title);
    var arrsinger = JSON.parse(reqData.singer);
    var title = arrtitle.value.toUpperCase();
    var singer = arrsinger.value.toUpperCase();  
    var varcol = "";
    if (title !== "" && singer !== "") { 
      varcol = "%"+title+"%";
      query.whereRaw('upper(title) like ?', [varcol]); 
      varcol = "%"+singer+"%";
      query.whereRaw('upper(singer) like ?', [varcol]); 
    }
    if (title !== "" && singer === "") {
      varcol = "%"+title+"%";
      query.whereRaw('upper(title) like ?', [varcol]); /*  \'%??%\'' */
    }
    if (title === "" && singer !== "") {
      varcol = "%"+singer+"%";
      query.whereRaw('upper(singer) like ?', [varcol]); /*  \'%??%\'' */
    }
  }

  return query
    .then(item => {
      res.json(item)
    })
    .catch(err => res.status(400).json({dbError: 'db error (paging) data)'}))
}

const postTableData = (req, res, db, dbname) => {
  var data  = req.body.params;
  console.log("data",req.body.params);
  //var data = reqData.params;
  var data_to_save = null;
  switch(dbname) {
    case "reserved": {
      data_to_save = {
        user_id: data.user_id,
        song_number: data.song_number,
        all_songs_id: data.all_songs_id,
        provider_id: data.provider_id,
        model: data.model,
        volume: data.volume,
        song_type: data.song_type
      };
      break;
    }
    case "songs": {
      data_to_save = {
        title: data.newTitle, genre_id: data.newGenre_id, song_numbere: data.newSong_number,
        composer: data.newComposer, singer: data.newSinger
      };
      break;
    }
    case "artist": {
      data_to_save = { name: data.newName };
      break;
    }
    case "genre": {
      data_to_save = {
        name: data.newName, level: data.newLevel
      };
      break;
    }
    case "providers": {
      data_to_save = {
        name: data.newName, product_name: data.newProduct_name, product_model: data.newProduct_model
      };
      break;
    }
  }      
  db(dbname)
    .insert(data_to_save)
    .returning('*')
    .then(item => {
      res.json(item)
    })
  .catch(err => res.status(400).json({
    data: data_to_save,
    error: err,
    dbError: 'db error ('+dbname+') layout (insert data)'
  }))
}

const getTableSearch = (req, res, db) => {
  var reqData  = req.query;
  var title = reqData.title;
  var singer = reqData.singer;  
  let query = db
    .select('*')
    .from('view_allsongs');

    if (reqData.sortkey) {
      query.orderBy(reqData.sortkey);    
    }
  
  return query
    .then(items => {
      if(items.length){
        res.json({
          dataExists: true,
          items:items})
      } else {
        res.json({
          dataExists: 'false',
          items:[]})
      }
    })
    .catch(err => res.status(400).json({
      error: err,
      dbError: 'db search error '})
    )
}

const putTableData = (req, res, db, dbname) => {
  switch(dbname) {
    case "genre": {
      const { id, name, level } = req.body
      var data_to_save = {
        name: data.newName, level: data.newLevel
      };

      db('genre')
        .where({id})
        .update(data_to_save)
        .returning('*')
        .then(item => {
          res.json(item)
        })
        .catch(err => res.status(400).json({
          data: data_to_save,
          error: err,
          dbError: 'db layout error (update data)'}))
      break;
    }      
    case "artist": {
      const { id, data } = req.body
      var data_to_save = { name: data.newName };

      db('artist')
        .where({id})
        .update(data_to_save)
        .returning('*')
        .then(item => {
          res.json(item)
        })
        .catch(err => res.status(400).json({
          data: data_to_save,
          error: err,
          dbError: 'db layout error (update data)'}))
      break;
    }      
    case "songs": {
      const { id, data } = req.body
      var data_to_save = {
        title: data.newTitle, genre_id: data.newGenre_id, song_numbere: data.newSong_number,
        composer: data.newComposer, singer: data.newSinger
      };

      db('songs')
        .where({id})
        .update(data_to_save)
        .returning('*')
        .then(item => {
          res.json(item)
        })
        .catch(err => res.status(400).json({
          data: data_to_save,
          error: err,
          dbError: 'db layout error (update data)'}))
      break;
    }      

    case "providers": {
        const { id, data } = req.body
        var data_to_save = {
          name: data.newName, product_name: data.newProduct_name, product_model: data.newProduct_model
        };

        db('providers')
          .where({id})
          .update(data_to_save)
          .returning('*')
          .then(item => {
            res.json(item)
          })
          .catch(err => res.status(400).json({
            data: data_to_save,
            error: err,
            dbError: 'db layout error (update data)'}))
        break;
    }      

    default: {
      //statements;
      break;
    }
  }
}

const getTableDataByColumn = (req, res, db) => {
  var reqData  = req.query;
  var dbname = reqData.dbname || "user";
  var col = reqData.col || "id";
  var val = reqData.val;
  db(dbname)
    .select()
    .where(col,val)
    .then(items => {
      if(items.length){
        res.json(items)
      } else {
        res.json({items:[], dataExists: 'false'})
      }
    })
    .catch(err => res.status(400).json({
      dbError: 'db error (get select by column data)'})
    )

}
module.exports = {
  getJoinTableData,
  getTableData,
  getPagingTableData,
  putTableData,
  postTableData,
  getTableWhereData,
  getTableDataByColumn,
  getTableSearch
}