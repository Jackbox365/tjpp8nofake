var revers_userchat = 1;	//Если 1, то в пользовательском чате последние сообщения будет сницу. Если 0, то новые будут сверху.
var fpm_frequency = 5000;	//Частота обновления окна чата
var fpm_update_interacrions_max = 20;	//Сколько раз будет обновляться окно чата с момента последнего бездействия
var fpstart=0,fpm_update_interacrions=0,fpm_interval=null;

function fpm_update(name){
	if(fpm_update_interacrions>fpm_update_interacrions_max) clearInterval(fpm_interval);
	fpm_update_interacrions+=1;
	$.post(dle_root+"engine/ajax/fpm/pm_main.php",{name:name},function(data){
		$("#fpm-content").html(data);
	});
	$.post(dle_root+"engine/ajax/fpm/users.php",{},function(data){
		$("#fpm-right ul").html(data);
	});
}
function fpm_begin_chat(name,lastdate,link,foto){
	clearInterval(fpm_interval);
	$("#fpm-textinput").slideUp(300).find('textarea').val('');
	$("#fpm-content").addClass('fpmload');
	$("#fpm-actions").fadeOut(500);
	$.post(dle_root+"engine/ajax/fpm/pm_main.php",{name:name},function(data){
		$("#fpm-textinput-profile").html("<strong> "+name+"</strong> | Был в сети: "+lastdate).attr('href',link);
		$("#fpm_textinput-send").data('name',name);
		$("#fpm-textinput img").attr('src',foto);
		$("#fpm-content").html(data).removeClass('fpmload').animate({height:350},300);
		if(revers_userchat) $("#fpm-content").animate({scrollTop:100000},500);
		$("#fpm-textinput").slideDown(300);
		$("#fpm-right ul li a[title='"+name+"']").parent().find('.fpm-message-icon').remove();
		$("#fpm-mini-area ul li a[title='"+name+"']").parent().remove();
		fpm_interval = setInterval(fpm_update,fpm_frequency,name);
	});
	return false;
}
function fpm_find_clear(){
	$("#fpm-user-find").fadeOut(300);
	$("#fpm-user-find-close").css({display:'none'});
	$("#fpm-head input").val('');
	return false;
}
function fpm_load_users(){
	$("#fpm-right ul").addClass('fpmload');
	$.post(dle_root+"engine/ajax/fpm/users.php",{},function(data){
		$("#fpm-right ul").html(data).removeClass('fpmload');
	});
}
function fpm_load_content(){
	clearInterval(fpm_interval);
	fpstart = 0;
	$("#fpm-content").addClass('fpmload');
	$.post(dle_root+"engine/ajax/fpm/pm_main.php",{},function(data){
		$("#fpm-content").html(data).removeClass('fpmload').animate({scrollTop:0},500);
	});
}
function fpm_more_content(){
	fpstart +=1;
	$("#fpm-content").addClass('fpmload');
	$.post(dle_root+"engine/ajax/fpm/pm_main.php",{cstart:fpstart},function(data){
		$(".fpm-show-more").remove();
		$("#fpm-content").append(data).removeClass('fpmload');
	});
}
function fpm_send_message(name){
	var text = $("#fpm-textinput-text textarea").val();
	if(name==''){
		alert('Ошибка шаблона, откройте окно диалога заново');
		return false;
	}
	if(text.length<1){
		alert('Вы не ввели сообщение');
		return false;
	}
	clearInterval(fpm_interval);
	$("#fpm-content").addClass('fpmload');
	$.post(dle_root+"engine/ajax/fpm/send.php",{name:name,text:text},function(data){
		$("#fpm-content").html(data).removeClass('fpmload').animate({scrollTop:100000},500);
		$("#fpm-textinput-text textarea").val('');
		fpm_interval = setInterval(fpm_update,fpm_frequency,name);
	});
}
function fpm_toggle_form(){
	$("#fpm-mini-area").fadeOut(500);
	$("#fpm-area").fadeIn(500);
	fpm_load_users();
	fpm_load_content();
	return false;
}
function fpm_to_user(name){
	$("#fpm-mini-area").fadeOut(500);
	$("#fpm-area").fadeIn(500);
	$.post(dle_root+"engine/ajax/fpm/userinfo.php",{name:name},function(data){
		fpm_begin_chat(data.name,data.lastdate,data.link,data.foto);
	},"JSON");
	fpm_load_users();
	return false;
}
function fpm_fast_action(action){
	var id=0,name='';
	if(action=='unread' || action=='read'){
		$("input.fpm_select_option:checked").each(function(){
			id = $(this).val();
			if(action=='unread') $(this).parents('li').find("a.fpm-li-login").append(' <i class="fpm-message-icon" style="display: none"></i>');
			else{
				$(this).parents('li').find(".fpm-message-icon").remove();
				name = $.trim( $(this).parents('li').find(".fpm-li-login").html() );
				$("#fpm-mini-area ul li a[title='"+name+"']").parent().remove();
				$("#fpm-right ul li a[title='"+name+"']").parent().find('.fpm-message-icon').remove();
			}
			$.get(dle_root+"engine/ajax/fpm/action.php",{id:id,action:action});
		});
	}else if(action=='delete' || action=='ignore' || action=='spam'){
		if(action=='delete' && !confirm("Точно удалить выбранные сообщения?")) return;
		if(action=='ignore'){
			alert('Функция временно не доступна');
			return false;
		}
		if(action=='ignore' && !confirm("Вы уверены, что хотите удалить все сообщения выбранных пользователей и больше не получать от них письма?")) return;
		if(action=='spam' && !confirm("Это точно спам?")) return;
		$("input.fpm_select_option:checked").each(function(){
			id = $(this).val();
			$(this).parents('li').slideUp(500,function(){
				$(this).remove();
			});
			$.get(dle_root+"engine/ajax/fpm/action.php",{id:id,action:action});
		});
	}
	$("#fpm-actions").fadeOut(500);
	$('.fpm-li-select').removeClass('fpm-li-select');
	$("input.fpm_select_option").attr('checked',null);
	return false;
}

$(document)
.on("click","#fpm-mini-footer",function(){
	$("#fpm-mini-area ul").slideToggle(700);
	$("#fpm-mini-footer i").toggleClass('fitoggle');
	if($.cookie("fpm-mini")==0) $.cookie("fpm-mini",1);
	else $.cookie("fpm-mini",0);
	return false;
})
.on("click","#fpm-mini-area h4",function(){
	fpm_toggle_form();
	return false;
})
.on("click","#fpm-head-close", function(){
	$("#fpm-actions").fadeOut(500);
	$("#fpm-area").fadeOut(500);
	if($("#fpm-mini-area li").length>0) $("#fpm-mini-area").fadeIn(500);
	$("#fpm-textinput").slideUp(300);
	$("#fpm-content").animate({height:430},350);
	clearInterval(fpm_interval);
	return false;
})
.on("click","#fpm-textinput-a, #fpm-right-head",function(){
	$("#fpm-textinput").slideUp(350).val('');
	$("#fpm-content").animate({height:430},350);
	fpm_load_content();
	return false;
})
.on("click","#fpm-right-head-clear",function(){
	if(confirm("Точно удалить все сообщения?")){
		$.post(dle_root+"engine/ajax/fpm/clear_story.php",{area:'all'},function(error){
			if(error) alert(error);
			else{
				$("#fpm-textinput").slideUp(350).val('');
				$("#fpm-content").animate({height:430},350);
				fpm_load_content();
				fpm_load_users();
			}
		});
	}
	return false;
})
.on("click","#fpm-textinput-clear",function(){
	var name = $("#fpm_textinput-send").data('name');
	if(confirm("Точно удалить всю историю переписки с "+name)){
		$.post(dle_root+"engine/ajax/fpm/clear_story.php",{name:name},function(error){
			if(error) alert(error);
			else{
				$("#fpm-content li").slideUp(500);
				$("#fpm-right ul li a[title='"+name+"']").parent().slideUp(500);
				$("#fpm-mini-area ul li a[title='"+name+"']").parent().remove();
			}
		});
	}
	return false;
})
.on("keyup","#fpm-head input",function(){
	var name = $(this).val();
	if(name.length>0){
		$.post(dle_root+"engine/ajax/fpm/users_find.php",{name:name},function(data){
			if(data){
				$("#fpm-user-find").html(data).fadeIn(300);
				$("#fpm-user-find-close").css({display:'inline-block'});
			}else{
				$("#fpm-user-find").fadeOut(300);
				$("#fpm-user-find-close").css({display:'none'});
			}
		});
	}else{
		$("#fpm-user-find").fadeOut(300);
		$("#fpm-user-find-close").css({display:'none'});
	}
})
.on("click","#fpm-user-find-close",function(){
	fpm_find_clear();
	return false;
})
.on("click","#fpm_textinput-send",function(){
	fpm_send_message($(this).data('name'));
	return false;
})
.on("keypress","#fpm-textinput-text textarea",function(event){
	if( (event.ctrlKey && event.keyCode == 13) || event.keyCode == 10) fpm_send_message($("#fpm_textinput-send").data('name'));
})
.on("click","#fpm-content li input.fpm_select_option",function(){
	clearInterval(fpm_interval);
	$(this).parents('li').toggleClass('fpm-li-select');
	if($("input.fpm_select_option:checked").length>0) $('#fpm-actions').fadeIn(400);
	else $('#fpm-actions').fadeOut(500);
})
.on("click","#fpm-right-close",function(){
	$(this).toggleClass('fpm-right-close');
	$("#fpm-right").animate({width:'toggle'},500);
	if(parseInt($("#fpm-main").css('marginRight'))==mr){
		$("#fpm-main").animate({marginRight:$(this).width()},500);
		$.cookie("fpm_right_block",0);
	}
	else{
		$("#fpm-main").animate({marginRight:mr},500);
		$.cookie("fpm_right_block",mr);
	}
	return false;
});

$(function(){
	setInterval(function(){$(".fpm-message-icon").fadeToggle(300);},500);
	if($.cookie("fpm-mini")==0){
		$("#fpm-mini-area ul").hide();
		$("#fpm-mini-footer i").addClass('fitoggle');
	}
	if($.cookie("fpm_right_block")==0){
		$("#fpm-right").hide();
		$("#fpm-main").animate({marginRight:$("#fpm-right-close").width()},10);
		$("#fpm-right-close").addClass('fpm-right-close');
	}
	var mr = parseInt($("#fpm-main").css('marginRight'));
	$("#fpm-area").draggable({handle:"#fpm-head"});
});