function AVDom(id,tracerManager,editor,topMenu) {
  var domid = '#' + id;
    
  $('.av-btn input').click((e) => {
    e.stopPropagation();
  });

  $(document).mouseup(function (e) {
    tracerManager.command('mouseup', e);
  });
  
  const minInterval = 0.1;
  const maxInterval = 10;
  const startInterval = 0.5;
  const stepInterval = 0.1;
  
  const $interval = $(domid + '-interval');
  $interval.val(startInterval);
  $interval.attr({
    max: maxInterval,
    min: minInterval,
    step: stepInterval
  });
  
  const normalize = (sec) => {
    let interval;
    let message;
    if (sec < minInterval) {
      interval = minInterval;
      message = `Interval of ${sec} seconds is too low. Setting to min allowed interval of ${minInterval} second(s).`;
    } else if (sec > maxInterval) {
      interval = maxInterval;
      message = `Interval of ${sec} seconds is too high. Setting to max allowed interval of ${maxInterval} second(s).`;
    } else {
      interval = sec;
      message = `Interval has been set to ${sec} second(s).`
    }

    return [interval, message];
  };

  $(domid + '-interval').on('change', function() {
    const [seconds, message] = normalize(Number.parseFloat($(this).val()));

    $(this).val(seconds);
    tracerManager.interval = seconds * 1000;
    console.log(message);
  });
  
  const $module_container = $(domid + '-tab_module');

  $module_container.on('mousedown', '.module_wrapper', function(e) {
    tracerManager.findOwner(this).mousedown(e);
  });

  $module_container.on('mousemove', '.module_wrapper', function(e) {
    tracerManager.findOwner(this).mousemove(e);
  });

  $module_container.on('DOMMouseScroll mousewheel', '.module_wrapper', function(e) {
    tracerManager.findOwner(this).mousewheel(e);
  });
  
  const $btnRun = $(domid + '-btn_run');
  const $btnPause = $(domid + '-btn_pause');
  const $btnPrev = $(domid + '-btn_prev');
  const $btnNext = $(domid + '-btn_next');
  
  topMenu.disableFlowControl();
  
  $btnRun.click(() => {
    $btnPause.removeClass('av-active');
    $btnRun.addClass('av-active');
    topMenu.enableFlowControl();
    var err = editor.execute();
    if (err) {
      console.error(err);
      topMenu.resetTopMenuButtons();
    }
  });

  $btnPause.click(() => {
    $btnRun.toggleClass('av-active');
    $btnPause.toggleClass('av-active');
    if (tracerManager.isPause()) {
      tracerManager.resumeStep();
    } else {
      tracerManager.pauseStep();
    }
  });

  $btnPrev.click(() => {
    $btnRun.removeClass('av-active');
    $btnPause.addClass('av-active');
    tracerManager.pauseStep();
    tracerManager.prevStep();
  });

  $btnNext.click(() => {
    $btnRun.removeClass('av-active');
    $btnPause.addClass('av-active');
    tracerManager.pauseStep();
    tracerManager.nextStep();
  });
  
  $(window).resize(function() {
    tracerManager.resize();
  });
}

