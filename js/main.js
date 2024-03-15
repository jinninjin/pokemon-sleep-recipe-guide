
const INGREDIENTS_LIST = Object.keys(INGREDIENTS)

 const RECIPE_LIST = (() => {
    let ret = {1:[], 2:[], 3:[]}
    for (let key in RECIPE_NAMES){
        let type = parseInt(key.substring(6,7))
        ret[type].push(key)
    }
     return ret
 })()

window.addEventListener("load", function(){
    try{
        const queryString = (() => {
            const queryStringWithQuestion = window.location.search
            if (queryStringWithQuestion.length===0){
                return ""
            }else{
                return queryStringWithQuestion.substring(1)
            }
        })()
        validateQueryString(queryString)
        reflectQueryStringOnScreen(queryString)
        showTable(queryString)
        setURL()
    }catch(error){
        showErrorMessage()
    }
})
function validateQueryString(queryString){
    const dishType = getValueFromQueryString(queryString, "dishType")
    const potSize = getValueFromQueryString(queryString, "potSize")
    const ingredients = getValueFromQueryString(queryString, "ingredients")
    const options = getValueFromQueryString(queryString, "options")
    if(!dishType in RECIPE_TYPE){throw "error"}
    if(potSize<POT_SIZE_MIN || POT_SIZE_MAX<potSize){throw "error"}
    if(ingredients.length!==INGREDIENTS_LIST.length){
        const formattedIngredients = (ingredients + "0".repeat(INGREDIENTS_LIST.length)).substring(0, INGREDIENTS_LIST.length)
        const url = URL + "?dishType=" + dishType + "&potSize=" + potSize + "&ingredients=" + formattedIngredients + "&options=" + options
        redirect(url)
    }
    if(containsOnly(ingredients,"01")===false){throw "error"}
    if(options.length!==OPTIONS.length){
        const formattedOptions = (options + "0".repeat(OPTIONS.length)).substring(0, OPTIONS.length)
        const url = URL + "?dishType=" + dishType + "&potSize=" + potSize + "&ingredients=" + ingredients + "&options=" + formattedOptions
        redirect(url)
    }
    if (containsOnly(options, "01")===false){throw "error"}

}
function getValueFromQueryString(queryString, inputKey){
    const keyValueList = queryString.split("&")
    for(let i=0; i<keyValueList.length; i++){
        keyValue = keyValueList[i].split("=")
        const key = keyValue[0]
        const value = keyValue[1]
        if (key===inputKey){
            return value
        }
    }
    return ""
}
function containsOnly(str, elem){
    const elems = (() => {
        const retVal = new Set()
        for (let i=0; i<elem.length; i++){
            retVal.add(elem[i])
        }
        return retVal
    })()
    for (let i=0; i<str.length; i++){
        if (elems.has(str[i])){}else{return false}
    }
    return true
}
function reflectQueryStringOnScreen(queryString){
    const dishType = getValueFromQueryString(queryString, "dishType")
    const potSize = getValueFromQueryString(queryString, "potSize")
    const ingredients = getValueFromQueryString(queryString, "ingredients")
    const options = getValueFromQueryString(queryString, "options")
    setDishType(dishType)
    setPotSize(potSize, options.substring(0, 1))
    setIngredients(ingredients)
    setOptions(options)
}
function setDishType(type){
    const elems = document.getElementsByName("dish-type")
    for (let i=0; i<elems.length; i++){
        const elem = elems.item(i)
        if (elem.value===type){
            elem.checked = true
        }else{
            elem.checked = false
        }
    }
}
function setPotSize(size, doubleState){
    const elem = document.getElementById("pot-size")
    if (doubleState==="1"){
        elem.value = 2 * size
    }else{
        elem.value = size
    }
}
function setIngredients(ingredients){
    for (let i=0; i<INGREDIENTS_LIST.length; i++){
        const elem = document.getElementById(INGREDIENTS_LIST[i])
        if (ingredients[i]==="1"){
            elem.checked = true
        }else{
            elem.checked = false
        }
    }
}
function setOptions(options){
    const sundayButtonState = options.substring(0,1)
        const elem = document.getElementById("double-pot-size")
    if (sundayButtonState==="1"){
        elem.checked = true
    }else{
        elem.checked = false
    }
}
function releaseDouble(){
    const elem = document.getElementById("double-pot-size")
    elem.checked = false
}
function showTable(queryString){        
    const dishType = getValueFromQueryString(queryString, "dishType")
    const potSize = (() => {
        const size = getValueFromQueryString(queryString, "potSize")
        const doubleFlg = getValueFromQueryString(queryString, "options").substring(0,1)
        if (doubleFlg==="1"){
            return size * 2
        }else{
            return size
        }
    })()
    const ingredientsState = getValueFromQueryString(queryString, "ingredients")
    const recipeList = RECIPE_LIST[dishType]
    for(let i=0; i<recipeList.length; i++){
        let recipe = RECIPE_NAMES[recipeList[i]]
        let requiredIngredients = recipe.ingredients
        let flg = 1
        let cnt = 0
        if (recipe.sum>potSize){
            flg = 0
        }
        for (ingredient in requiredIngredients){
            if (document.getElementById(ingredient).checked===false){
                flg = 0
            }
        }
        if (flg===0){
            addToTable(recipe, "canNotCook", )
        }else{
            addToTable(recipe, "canCook", )
        }
    }

}
function addToTable(recipe, tableId){
    let table = document.getElementById(tableId)
    let newRow = table.insertRow(1)
    let cell0 = newRow.insertCell(0)
    let cell1 = newRow.insertCell(1)
    let cell2 = newRow.insertCell(2)
    cell0.innerHTML = recipe.name
    let content = []
    for (ingredient in recipe.ingredients){
        if (document.getElementById(ingredient).checked===true){
            content.push(INGREDIENTS[ingredient]["name"] + ":" + recipe["ingredients"][ingredient])
        }else{
            content.push("<span>" + INGREDIENTS[ingredient]["name"] + ":" + recipe["ingredients"][ingredient] + "</span>")
        }
        
    }
    content.join("、")
    if (content.length===0){
        content = "None"
    }
    cell1.innerHTML = content
    if (recipe["sum"]<document.getElementById("pot-size").value){
        cell2.innerHTML = recipe["sum"]
    }else{
        cell2.innerHTML = "<span>" + recipe["sum"] + "</span>"
    }
    
}
function reflectInput(){
    try{
        const queryString = generateQueryString()
        const url = URL + "?" + queryString
        redirect(url)
    }catch(error){
        showErrorMessage()
    }
}
function validateAndReflectInput(){
    releaseDouble()
    validateInput()
    reflectInput()
}
function validateInput(){
    validatePotSize()
}
function validatePotSize(){
    const size = document.getElementById("pot-size").value
    if (isNaN(size)){throw "error"}
    if (size<POT_SIZE_MIN || POT_SIZE_MAX<size){throw "error"}
}
function generateQueryString(){
    const currentQueryString = window.location.search.substring(1)
    const potSize = (() => {
        const doubleState = getValueFromQueryString(currentQueryString, "options").substring(0,1)
        const currentQSPotSize = getValueFromQueryString(currentQueryString, "potSize")
        const potSizeText = document.getElementById("pot-size").value
        if ((doubleState==="0" && currentQSPotSize==potSizeText)||(doubleState==="1" && currentQSPotSize*2==potSizeText)){
            return currentQSPotSize
        }else{
            return document.getElementById("pot-size").value
        }
    })()
    const dishType = (() => {
        const elements = document.getElementsByName("dish-type")
        const len = elements.length
        for(let i=0; i<len; i++){
            let elem = elements.item(i)
            if (elem.checked===true){
                return elem.value
            }
        }
    })()
    const ingredients = (() => {
        let retVal = ""
        for (let i=0; i<INGREDIENTS_LIST.length; i++){
            let elem = document.getElementById(INGREDIENTS_LIST[i])
            if (elem.checked===true){
                retVal += "1"
            }else{
                retVal += "0"
            }
        }
        return retVal
    })()
    const options = (() => {
        let retVal = ""
        const doubleState = document.getElementById("double-pot-size").checked
        if (doubleState===true){
            retVal += "1"
        }else{
            retVal += "0"
        }
        return retVal
    })()
    const queryString = "potSize=" + potSize + "&dishType=" + dishType + "&ingredients=" + ingredients + "&options=" + options
    return queryString
}
function redirect(url){
    window.location.href = url
}
function showErrorMessage(){
    let elem = document.getElementById("error-label")
    elem.innerHTML = "Invalid Input or QueryString."
}
function setURL(){
    let elem = document.getElementById("currentURL")
    const URL = window.location.href
    elem.value = URL
}
function copyToClipboard(){
    let targetURL = document.getElementById("currentURL")
    targetURL.select()
    document.execCommand("Copy")

    document.getElementById("copy-message").innerHTML = "コピーしました"
}
function setDish(dishType){
    let radioButton = document.getElementsByName("dish-type")
    let len = Object.keys(RECIPE_TYPE).length
    for(let i=0; i<len; i++){
        if (i+1==dishType){
            radioButton[i].checked = true
            break
        }
    }
    reflectInput()
}
function toggle(id){
    let radio = document.getElementById(id)
    if (radio.checked){
        radio.checked = false
    }else{
        radio.checked = true
    }
}