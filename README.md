$docJS
======

Dynamic bind library. **Under development**

Basic example:

```html
<!DOCTYPE HTML>
<html lang="en-US">
<head>
	<meta charset="UTF-8">
	<title>$docJS - Example</title>
</head>
<body>
	
	Name: <input type="text" name="" id="txt" />
	<div id="lbl">Hello {{= value }}!</div>	
	
	<script type="text/javascript" src="docjs.js"></script>
	<script type="text/javascript">
	
		$doc.id('lbl').bindTmpl($doc.id('txt'));
		
	</script>
</body>
</html>
```

<iframe style="width: 100%; height: 300px" src="http://jsfiddle.net/Diullei/cNdrz/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

##Todo

A lot to do! :)