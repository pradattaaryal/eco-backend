const port = 4000;
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import cors from 'cors';
  

const app = express();



 
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb+srv://pradattaaryal2468:131n151-1a@cluster0.3fafosj.mongodb.net/e-commerce", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
  
// JWT Secret (Replace 'your-secret' with an actual secret key)
//const jwtSecret = 'your-secret';

// ... (Other middleware and routes)
// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});
// Image upload configuration
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// Serve images statically
 
app.use('/images', express.static(path.join(__dirname, 'upload/images')));

// Image upload endpoint
app.post('/upload', upload.single('product'), (req, res) => {
  res.json({
    success: "yeaaaaaaaaaaaaaaaaaaaa",
    image_url: `${req.file.filename}`
  });
});

//modeles for our products
const Product=mongoose.model("Product",{
  id:{
    type:Number,
    require:true,
  },
  name:{
    type:String,
    require:true,
  },
  image:{
    type:String,
    require:true,
  },
  category:{
    type:String,
    require:true,
  },
  new_price:{
    type:Number,
    require:true,
  },
  old_price:{
    type:Number,
    require:true,
  },
  date:{
    type:Date,
     default:Date.now,
  },
  available:{
    type:Boolean,
    default:true,
  },
  
})
app.post('/addproduct',async(req,res)=>{
  console.log('Received product data:', req.body);
  let products=await Product.find({});
  let id;

    if (products.length > 0) {
      let last_p = products[products.length - 1];
      id = last_p.id + 1;
    } else {
      id = 1;
    }
  const product=new Product ({
    id:id,
    name:req.body.name,
    image:req.body.image,
    category:req.body.category,
    new_price:req.body.new_price,
    old_price:req.body.old_price,
  });
  console.log(product);
  await product.save();
  console.log("saved");
  res.json({
    success:true,
    name:req.body.name,
  })

})
//creating endpoint for new collection data
app.get('/newcollection',async(req,res)=>{
  let product=await Product.find({});
  let newcollection=product.slice(1).slice(-8);
  
  res.send(newcollection);
})
const users=mongoose.model('users',{
  name:{
    type:String,
  },
  email:{
    type:String,
    unique:true,
  },
  password:{
    type:String,
  },
  cartData:{
    type:Object,
  },
  date:{
    type:Date,
    default:Date.now,
  }
})
const admin=mongoose.model('admin',{
  name:{
    type:String,
  },
  email:{
    type:String,
    unique:true,
  },
  password:{
    type:String,
  }
})

//end point for deleting
app.post('/removeproduct',async(req,res)=>{
  await Product.findOneAndDelete({id:req.body.id});
  console.log("removed");
  res.json({
    success:true,
    name:req.body.name
  })
})

//end point to get all product
app.get('/allproduct',async(req,res)=>{
  let products=await Product.find({})
   res.send(products)
})


app.post('/removeall',async(req,res)=>{
  await users.deleteMany({})
  res.json({
    success:true,
  })
})
 


//creating endpoint for login
app.post('/login',async(req,res)=>{
  if(req.body.isAdmin){
    let admind=await admin.findOne({email:req.body.email});
    if(admind){
      const compare=req.body.password===admind.password;
     
     if(compare){
      const data={
        admind:{
          id:admind.id
        }
      }
      const token=jwt.sign(data,'secret_ecom');
      res.json({success:true,token});
     }else{
      res.json({sucess:false,error:"something password"});
     }
   
     
    }else{
      res.json({sucess:false,error:"  wrong email"});
     }
   }else{
    let user=await users.findOne({email:req.body.email});
    if(user){
      const compare=req.body.password===user.password;
     
     if(compare){
      const data={
        user:{
          id:user.id
        }
      }
      const token=jwt.sign(data,'secret_ecom');
      res.json({success:true,token});
     }else{
      res.json({sucess:false,error:"something password"});
     }
   
     
    }else{
      res.json({sucess:false,error:"  wrong email"});
     }
   }
  

   

})
/*app.post('/login', (req, res) => {
  users.findOne({ email: req.body.email }).then(user => {
    if (user) {
      const passCompare = req.body.password === user.password;
      if (passCompare) {
        const data = { user: { id: user._id } };
        const token = jwt.sign(data, 'secret_ecom');
        res.json({ success: true, token });
      } else {
        res.json({ success: false, error: "Wrong password" });
      }
    } else {
      res.json({ success: false, error: "Wrong email address" });
    }
  }).catch(error => {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  });
});*/

 
 //creating endpoint for signup
app.post('/signup',async(req,res)=>{
  let check=await users.findOne({email:req.body.email});
  if(check){
    return res.status(400).json({sucess:false,errors:"eisting error found with same email address"})
  }
  let cart={};
  for(let i=0;i<300;i++){
    cart[i]=0;
  }
  const user=new users({
 email:req.body.email,
 password:req.body.password,
 cartData:req.body.cart,
  })
  await user.save();
  const data={
    user:{
      id:user.id
    }
  }
  const token=jwt.sign(data,'secret_ecom');
  res.json({sucess:true,token})
})




app.post('/addtocart',async(req,res)=>{
   console.log(req.body);
})

app.get('/', (req, res) => {
  res.send(`Express is running on https://eco-backend-boxa.onrender.com/`);
});

// Start the server
app.listen(port, (err) => {
  if (!err) {
    console.log("Server is running");
  } else {
    console.error("Error starting server:", err);
  }
});
