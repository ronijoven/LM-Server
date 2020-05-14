const getTableData = (req, res, db, dbname) => {
    db.select('*')
      .from(dbname)
      .then(items => {
        if(items.length){
          res.json(items)
        } else {
          res.json({dataExists: 'false'})
        }
      })
      .catch(err => res.status(400).json({
        dbError: 'db error (get all data)'})
      )
  }

  const postTableData = (req, res, db, dbname) => {
    switch(dbname) {
      case "layout": {
        const { name, size, layout } = req.body
        var layouts = { 
          lg: size==="lg" ? layout : [],
          md: size==="md" ? layout : [],
          sm: size==="md" ? layout : [],
          xs: size==="md" ? layout : []
        };
        db("layout")
          .insert(
            { name, layouts }
          )
          .returning('*')
          .then(item => {
            res.json(item)
          })
        .catch(err => res.status(400).json({dbError: 'db error layout (insert data)'}))
        break;
      }
      default: {
        //statements;
        break;
      }
    }
}

const putTableData = (req, res, db, dbname) => {
    switch(dbname) {
      case "layout": {
        const { id, size, name, layout } = req.body
        var col_fld = "{"+size+"}";
        db('layout')
          .where({id})
          .update({name: name, 
            layouts: db.raw('jsonb_set(??, layouts, ?)', ['layouts', layout ])})
          .returning('*')
          .then(item => {
            res.json(item)
          })
          .catch(err => res.status(400).json({
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
    getTableData,
    putTableData,
    postTableData,
    getTableDataByColumn
}