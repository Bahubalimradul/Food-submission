const express = require("express");
const router = express.Router();
const upload = require("./multer.js");
const pool = require("./pool.js");
var { LocalStorage } = require("node-localstorage")
var localStorage = new LocalStorage('./scratch')
const fs = require("fs");

// router.get("/food_interface", function (req, res) {
//   res.render("foodinterface", { message:" "});
// });
router.get("/food_interface", function (req, res) {
  try {
    var admin = JSON.parse(localStorage.getItem("Admin"))
    if (admin == null) {
      res.render('adminlogin', { message: '' })
    }
    else {
      res.render('foodinterface', { data: admin, status: true, message: 'Login Success' });
    }
  }
  catch {
    res.render('adminlogin', { message: '' })
  }
})

router.get("/About_Us",function(req, res){
  res.render('AboutUs',{message:""})
})

router.post("/submit_food", upload.single("foodpicture"), function (req, res) {
  try {
    console.log("BODY", req.body);
    console.log("FILE", req.file);
    pool.query(
      "insert into fooditems(categoryid,subcategoryid,foodname,indgredients,description,price,offerprice,foodtype,status,foodpicture) values(?,?,?,?,?,?,?,?,?,?)",
      [
        req.body.categoryid,
        req.body.subcategoryid,
        req.body.foodname,
        req.body.indgredients,
        req.body.description,
        req.body.price,
        req.body.offerprice,
        req.body.foodtype,
        req.body.status,
        req.file.filename,
      ],
      function (error, result) {
        if (error) {
          console.log("Error", error);
          res.render("foodinterface", {
            message:
              "There is Issue in database..Pls contact with data administrator.",
          });
        } else {
          res.render("foodinterface", {
            message: "Food item is submited successfully.....",
          });
        }
      }
    );
  } catch (e) {
    res.render("foodinterface", {
      message: "Server Error.. Pls contact with backend team" + e,
    });
  }
});

router.get("/fillcategory", function (req, res) {
  try {
    pool.query("select * from category", function (error, result) {
      if (error) {
        res.json({
          data: [],
          status: false,
          message: "Data base error..Pls contact with database administrator",
        });
      } else {
        res.json({ data: result, status: true, message: "Success" });
      }
    });
  } catch (e) {
    req.json({
      data: [],
      status: false,
      message: "Server error..Pls contact with backend team",
    });
  }
});

router.get("/fillsubcategory", function (req, res) {
  try {
    pool.query(
      "select * from subcategory where categoryid = ?",
      [req.query.categoryid],
      function (error, result) {
        if (error) {
          res.json({
            data: [],
            status: false,
            message: "Database error. Please contact support.",
          });
        } else {
          res.json({ data: result, status: true, message: "Success" });
        }
      }
    );
  } catch (e) {
    res.json({
      data: [],
      status: false,
      message: "Server error..Pls contact with backend team",
    });
  }
});

router.get("/display_all_food", function (req, res) {
  try {
    var admin = JSON.parse(localStorage.getItem("Admin"))
    if (admin == null) {
      res.render('adminlogin', { message: '' })
    }
    else {
      try {
        pool.query(
          "select F.*,(select C.categoryname from category C where C.categoryid=F.categoryid) as categoryname,(select S.subcategoryname from subcategory S where S.subcategoryid=F.subcategoryid ) as subcategoryname from fooditems F",
          function (error, result) {
            if (error) {
              res.render("displayallfood", { status: false, data: [] });
            } else {
              res.render("displayallfood", { status: true, data: result });
            }
          }
        );
      } catch (e) {
        res.render("displayallfood", { status: false, data: [] });
      }
    }
  }
  catch {
    res.render('adminlogin', { message: '' })
  }

});

router.get("/show_food", function (req, res) {
  pool.query(
    "select F.*,(select C.categoryname from category C where C.categoryid=F.categoryid) as categoryname,(select S.subcategoryname from subcategory S where S.subcategoryid=F.subcategoryid ) as subcategoryname from fooditems F where F.foodid=?",
    [req.query.foodid],
    function (error, result) {
      if (error) {
        res.render("showfood", { status: false, data: [] });
      } else {
        res.render("showfood", { status: true, data: result[0] });
      }
    }
  );
});


router.post("/update_food_data", function (req, res) {
  console.log(req.body);
  if (req.body['edit'] == "edit"){
    try {
      pool.query(
        "update fooditems set categoryid=?, subcategoryid=?,foodname=?,indgredients=?,description=?,price=?,offerprice=?,foodtype=?,status=? where foodid=?", [
        req.body.categoryid,
        req.body.subcategoryid,
        req.body.foodname,
        req.body.indgredients,
        req.body.description,
        req.body.price,
        req.body.offerprice,
        req.body.foodtype,
        req.body.status,
        req.body.foodid
      ],
        function (error, result) {
          if (error) {
            console.log(error);
            res.redirect("/food/display_all_food");
          } else {
            res.redirect("/food/display_all_food");
          }
        }
      );
    }
    catch
    {
      res.redirect("/food/display_all_food")
    }
  }
  else{
    try{
      pool.query("delete from fooditems where foodid = ?",[req.body.foodid],
        function (error, result) {
          if (error) {
            console.log(error);
            res.redirect("/food/display_all_food");
          } else {
            res.redirect("/food/display_all_food");
          }
        }
      )
    }
    catch{
      res.redirect("/food/display_all_food");
    }
  }
});

router.get("/show_picture", function (req, res) {
  console.log(req.query);
  res.render("showpicture", { data: req.query });
});

router.post("/edit_picture", upload.single("foodpicture"), function (req, res) {
  pool.query(
    "update fooditems set foodpicture=? where foodid=?",
    [req.file.filename, req.body.foodid],
    function (error, result) {
      if (error) {
        res.redirect("/food/display_all_food");
      } else {
        console.log(`F:/foodproject/public/images/${req.body.oldfoodpicture}`);
        fs.unlinkSync(
          `F:/foodproject/public/images/${req.body.oldfoodpicture}`,
          function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log("Deleted");
            }
          }
        );
        res.redirect("/food/display_all_food");
      }
    }
  );
});

module.exports = router;
