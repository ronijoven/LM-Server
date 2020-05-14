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
        const { name, layouts, lg, md, sm, xs, xxs} = req.body
        db("layout")
          .insert(
            { name, layouts, lg, md, sm, xs, xxs }
          )
          .returning('*')
          .then(item => {
            res.json(item)
          })
        .catch(err => res.status(400).json({
          error: err,
          dbError: 'db error layout (insert data)'
        }))
        break;
      }
      default: {
        break;
      }
    }
}

const putTableData = (req, res, db, dbname) => {
    switch(dbname) {
      case "layout": {
        const { id, size, name, layout, property } = req.body

        var data_to_save = [];
        if (size==="lg")  data_to_save = { name: name, lg: layout, lg_property: property };
        if (size==="md")  data_to_save = { name: name, md: layout, md_property: property };
        if (size==="sm")  data_to_save = { name: name, sm: layout, sm_property: property };
        if (size==="xs")  data_to_save = { name: name, xs: layout, xs_property: property };
        if (size==="xxs") data_to_save = { name: name, xxs: layout, xxs_property: property };
          
        db('layout')
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
    getTableData,
    putTableData,
    postTableData,
    getTableDataByColumn
}