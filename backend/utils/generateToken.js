import jwt from "jsonwebtoken";

export const cookieOptions=()=>({httpOnly:true,secure:process.env.NODE_ENV!=='development',sameSite:'strict',path:'/'});
export const clearToken=res=>res.clearCookie('jwt',cookieOptions());
const generateToken = (res, userId, sessionVersion=0) => {
  const token = jwt.sign({ userId, sessionVersion }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, {
    ...cookieOptions(),
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;
