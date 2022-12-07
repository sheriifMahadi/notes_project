
function checkUser(request, response){
  const user = request.user 
  if (!user){return null}
}

module.exports = {
  checkUser
}

