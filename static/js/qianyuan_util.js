

function toolbarGoBack(){
	var elem = document.getElementById("toolbar_imagery_menu");
    while(elem.hasChildNodes()) //当elem下还存在子节点时 循环继续
    {
        elem.removeChild(elem.firstChild);
    }
    document.getElementById("toolbar").style.display = "block";
}