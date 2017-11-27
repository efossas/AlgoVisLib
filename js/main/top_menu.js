function AVTopMenu(id) {
	this.id = '#' + id;
	
	const flowControlBtns = [ $(this.id + '-btn_pause'), $(this.id + '-btn_prev'), $(this.id + '-btn_next') ];
	const setFlowControlState = (isDisabled) => {
	  flowControlBtns.forEach($btn => $btn.attr('disabled', isDisabled));
	};
	
	this.enableFlowControl = () => {
	  setFlowControlState(false);
	};
	
	this.disableFlowControl = () => {
	  setFlowControlState(true);
	};
	
	this.resetTopMenuButtons = () => {
	  $(this.id + '-top-menu-buttons button').removeClass('av-active');
	  this.disableFlowControl();
	  // removed: editor.unhighlightLine();
	};
	
	this.setInterval = (val) => {
	  $(this.id + '-interval').val(interval);
	};
	
	this.activateBtnPause = () => {
	  $(this.id + '-btn_pause').addClass('av-active');
	};
	
	this.deactivateBtnPause = () => {
	  $(this.id + '-btn_pause').removeClass('av-active');
	};
}

