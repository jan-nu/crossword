(function ($, window, document, undefined) {

  'use strict';

  $(function () {

  	// Input ввода значения в ячейку
		var input = '<input type="text" class="input cross-cell__input" maxlength="1" spellcheck="false">',
		// Номер слова в ячейке
  			number = '<span class="cross-cell__num"></span>',
  	// Массив ячеек
  			cells = [],
  	// Количество ячеек в ряду/столбике
  			cellsInRow = 17,
  	// Выбранное слово
  			selectedWord = {},
  	// Коды кириллических букв, отличные от латиницы
  			whichArr = [186,188,190,192,219,221,222],
  	// Выбранный для игры кроссворд
  			curCross,
  	// Таймер игры
        gameTimer, 
    // Время игры (мс)
        gameCounterTime, 
  	// Опции cookie
        cookieOptions = {expires: 7, path: '/'};

    selectedWord['cells'] = [];

  	// Инициализация ячеек перед заполнением
  	function initCellsAdmin() {
  		for(var i = 0; i< cellsInRow; i++) {
	  		for(var j = 0; j<cellsInRow; j++) {
	  			var cell = {};
	  			// Номер ячейки по порядку
	  			cell['index'] = j + cellsInRow * i;
	  			// Номер ячейки по X
	  			cell['posX'] = j;
	  			// Номер ячейки по Y
	  			cell['posY'] = i;
	  			// Буква в ячейке
	  			cell['letter'] = '';
	  			// Является ли ячейка пустой
	  			cell['empty'] = true;
	  			// Является ли ячейка недоступной для заполнения
	  			cell['disabled'] = false;
	  			// Номер слова в ячейке
	  			cell['number'] = '';
	  			// Начинается ли в данной ячейке горизонтальное слово
	  			cell['isHorizontal'] = false;
	  			// Начинается ли в данной ячейке вертикальное слово
	  			cell['isVertical'] = false;
	  			// Является ли данная ячейка частью горизонтального слова
	  			cell['horizontalWord'] = false;
	  			// Является ли данная ячейка частью вертикального слова
	  			cell['verticalWord'] = false;
	  			// Задание, если в данной ячейке начинается горизонтальное слово
	  			cell['taskHorizontal'] = '';
	  			// Задание, если в данной ячейке начинается вертикальное слово
	  			cell['taskVertical'] = '';
	  			cells.push(cell);

	  			if(i<cellsInRow-1)
	  				$('.crossword-field').append('<div class="cross-cell"></div>');
	  			else
	  				$('.crossword-field').append('<div class="cross-cell last-row"></div>');
	  		}
	  	}
  	}

  	// Запуск таймера игры
    function startTimer() {
        gameCounterTime = 0;
        var minutes = parseInt(gameCounterTime/60);
        if ( minutes < 10 )
            minutes = '0'+minutes;
        var seconds = gameCounterTime % 60;
        if ( seconds < 10 )
            seconds = '0'+seconds;
        $('.cross-timer__minutes').html(minutes);
        $('.cross-timer__seconds').html(seconds);
        gameTimer = setInterval(function(){
            gameCounterTime++;
            var minutes = parseInt(gameCounterTime/60);
            if ( minutes < 10 )
                minutes = '0'+minutes;
            var seconds = gameCounterTime % 60;
            if ( seconds < 10 )
                seconds = '0'+seconds;
            $('.cross-timer__minutes').html(minutes);
            $('.cross-timer__seconds').html(seconds);
        },1000);
    }

    // Останов таймера
    function stopTimer(isGiveUp){
        clearInterval(gameTimer);        
        if(isGiveUp)
            return;
        var minutes = parseInt(gameCounterTime/60);
        if ( minutes < 10 )
            minutes = '0'+minutes;
        var seconds = gameCounterTime % 60;
        if ( seconds < 10 )
            seconds = '0'+seconds;

        var cookieName = 'cookie_cross-' + curCross['id'];

        if ( $.cookie(cookieName) ) {
            if ( $.cookie(cookieName) < gameCounterTime ){
                var cook_minutes = parseInt($.cookie(cookieName)/60);
                if ( cook_minutes < 10 )
                    cook_minutes = '0'+cook_minutes;
                var cook_seconds = $.cookie(cookieName) % 60;
                if ( cook_seconds < 10 )
                    cook_seconds = '0'+cook_seconds;
                $('.cross-popup-end__best-time').html(cook_minutes+':'+cook_seconds);
            } else {
                $('.cross-popup-end__best-time').html(minutes+':'+seconds);
                $.cookie(cookieName, gameCounterTime, cookieOptions);
            }
        } else {
            $('.cross-popup-end__best-time').html(minutes+':'+seconds);
            $.cookie(cookieName, gameCounterTime, cookieOptions);
        }
        // Текущее время игры
        $('.cross-popup-end__time .right').html(minutes+':'+seconds);
    }

  	// Очистка значений ячейки
  	function clearCell(index) {
			cells[index]['letter'] = '';
			cells[index]['empty'] = true;
			cells[index]['number'] = '';
			cells[index]['isHorizontal'] = false;
			cells[index]['isVertical'] = false;
			cells[index]['horizontalWord'] = false;
	  	cells[index]['verticalWord'] = false;
			// cells[index]['taskHorizontal'] = '';
			// cells[index]['taskVertical'] = '';
  	}

  	// Очистка номера ячейки
  	function clearNumber(index) {
  		cells[index]['number'] = '';
			cells[index]['isHorizontal'] = false;
			cells[index]['isVertical'] = false;
			// cells[index]['horizontalWord'] = false;
	  	// cells[index]['verticalWord'] = false;
			// cells[index]['taskHorizontal'] = '';
			// cells[index]['taskVertical'] = '';
  	}

  	// Сохранение значения одной ячейки
  	function saveCell(index, cell) {
  		cells[index]['letter'] = cell.find('.cross-cell__input').val();
  		cells[index]['empty'] = false;
  	}

  	// Сохранение значений ячеек
  	function saveAllCells() {
  		for(var i = 0; i< cellsInRow; i++) {
	  		for(var j = 0; j<cellsInRow; j++) {
	  			var curIndex = j + cellsInRow * i;
	  			var curCell = $('.cross-cell').eq(curIndex);
	  			// Если в ячеке есть input и он не пустой, сохраняем ячеку, иначе очищаем
	  			if(curCell.find('.cross-cell__input').length) {
	  				if(curCell.find('.cross-cell__input').val().trim() == '') {
	  					clearCell(curIndex);
	  				} else {
	  					saveCell(curIndex, curCell);
	  				}
	  			} else {
	  				clearCell(curIndex);
	  			}
	  		}
	  	}
	  	// Расстановка номеров после сохранения всех ячеек
	  	setNumbers();
  	}

  	// Расстановка номеров ячеек
  	function setNumbers() {
			for(var i = 0; i< cellsInRow; i++) {
	  		for(var j = 0; j<cellsInRow; j++) {
	  			var curIndex = j + cellsInRow * i;
	  			clearNumber(curIndex);
	  			var curCell = $('.cross-cell').eq(curIndex);
	  			// Предварительно очищаем ячейки
	  			if(curCell.find('.cross-cell__num').length) {
	  				curCell.find('.cross-cell__num').remove();
	  			}

	  			// Если ячейка не пустая
	  			if(!cells[curIndex]['empty']) {

		  			// Проверка на горизонтальные слова
		  			if(j == 0) {
		  				// Если первая ячейка в строке и следующая не пустые, добавляем номер
		  				if(!cells[curIndex + 1]['empty']) {
								curCell.append(number);
								curCell.find('.cross-cell__num').data('cellindex', curIndex);
								cells[curIndex]['isHorizontal'] = true;
								cells[curIndex]['number'] = curCell.find('.cross-cell__num').text();
		  				}
		  			} else if(j<cellsInRow-1) {
		  				// Если предыдущая ячейка пустая, а следующая пустая, добавляем номер
							if((!cells[curIndex + 1]['empty']) && (cells[curIndex - 1]['empty'])) {
								curCell.append(number);
								curCell.find('.cross-cell__num').data('cellindex', curIndex);
								cells[curIndex]['isHorizontal'] = true;
								cells[curIndex]['number'] = curCell.find('.cross-cell__num').text();
			  			}
		  			}

		  			// Проверка на вертикальные слова
		  			if(i == 0) {
		  				// Если первая ячейка в строке и следующая не пустые, добавляем номер
		  				if(cells[curIndex + cellsInRow]['empty'] == false) {
		  					if(!curCell.find('.cross-cell__num').length)
		  						curCell.append(number);
		  					curCell.find('.cross-cell__num').data('cellindex', curIndex);
								cells[curIndex]['isVertical'] = true;
								cells[curIndex]['number'] = curCell.find('.cross-cell__num').text();
		  				}
		  			} else if(i<cellsInRow-1) {
		  				// Если предыдущая ячейка пустая, а следующая пустая, добавляем номер
		  				if((cells[curIndex + cellsInRow]['empty'] == false) && (cells[curIndex - cellsInRow]['empty'] == true)) {
		  					if(!curCell.find('.cross-cell__num').length)
		  						curCell.append(number);
		  					curCell.find('.cross-cell__num').data('cellindex', curIndex);
								cells[curIndex]['isVertical'] = true;
								cells[curIndex]['number'] = curCell.find('.cross-cell__num').text();
		  				}
		  			}	  		
	  			}	 
	  			
	  		}
	  	}
	  	
	  	// После выставления номеров ячеек обновляем вопросы к словам и отмечаем ячейки, недоступные для заполнения
			updateQuestions(true);
			checkDisabled();
	  	
  	}

  	// Проверка ячеек на недоступность для заполнения
  	function checkDisabled() {
  		$('.cross-cell').removeClass('disabled');

			for(var i = 0; i< cellsInRow; i++) {
	  		for(var j = 0; j<cellsInRow; j++) {
	  			var curIndex = j + cellsInRow * i;
	  			// Сброс недоступности для всех ячеек
	  			cells[curIndex]['disabled'] = false;

	  			// Угловые условия
	  			// Левый верхний угол
	  			if((j == 0) && (i == 0)) {
	  				if((cells[curIndex]['empty'])
	  					&& (!cells[curIndex + 1]['empty'])
	  					&& (!cells[curIndex + cellsInRow]['empty'])
	  					&& (!cells[curIndex + cellsInRow + 1]['empty'])) {
		  					cells[curIndex]['disabled'] = true;
		  					$('.cross-cell').eq(curIndex).addClass('disabled');
	  				}
	  			}
	  			// Правый верхний угол
	  			else if ((j == cellsInRow-1) && (i == 0)) {
						if((cells[curIndex]['empty'])
							&& (!cells[curIndex - 1]['empty'])
							&& (!cells[curIndex + cellsInRow]['empty'])
							&& (!cells[curIndex + cellsInRow - 1]['empty'])) {
								cells[curIndex]['disabled'] = true;
		  					$('.cross-cell').eq(curIndex).addClass('disabled');
						}
	  			}
	  			// Нижний левый угол
	  			else if((j == 0) && (i == cellsInRow-1)) {
	  				if((cells[curIndex]['empty'])
	  					&& (!cells[curIndex + 1]['empty'])
	  					&& (!cells[curIndex - cellsInRow]['empty'])
	  					&& (!cells[curIndex - cellsInRow + 1]['empty'])) {
		  					cells[curIndex]['disabled'] = true;
		  					$('.cross-cell').eq(curIndex).addClass('disabled');
	  				}
	  			}
	  			// Нижний правый угол
	  			else if((i == cellsInRow-1) && (j == cellsInRow-1)) {
	  				if((cells[curIndex]['empty'])
	  					&& (!cells[curIndex - 1]['empty'])
	  					&& (!cells[curIndex - cellsInRow]['empty'])
	  					&& (!cells[curIndex - cellsInRow - 1]['empty'])) {
		  					cells[curIndex]['disabled'] = true;
		  					$('.cross-cell').eq(curIndex).addClass('disabled');
	  				}
	  			}

	  			// Условия в центре поля
	  			if((i>0) && (j>0) && (j<cellsInRow-1)) {
						if((cells[curIndex]['empty'])
	  					&& (!cells[curIndex - 1]['empty'])
	  					&& (!cells[curIndex + 1]['empty'])
	  					&& (!cells[curIndex - cellsInRow]['empty'])
	  					&& (!cells[curIndex - cellsInRow + 1]['empty'])
	  					&& (!cells[curIndex - cellsInRow - 1]['empty'])) {
		  					cells[curIndex]['disabled'] = true;
		  					$('.cross-cell').eq(curIndex).addClass('disabled');
	  				}
	  			}
	  			if((i<cellsInRow-1) && (j>0) && (j<cellsInRow-1)) {
						if((cells[curIndex]['empty'])
	  					&& (!cells[curIndex - 1]['empty'])
	  					&& (!cells[curIndex + 1]['empty'])
	  					&& (!cells[curIndex + cellsInRow]['empty'])
	  					&& (!cells[curIndex + cellsInRow + 1]['empty'])
	  					&& (!cells[curIndex + cellsInRow - 1]['empty'])) {
		  					cells[curIndex]['disabled'] = true;
		  					$('.cross-cell').eq(curIndex).addClass('disabled');
	  				}
	  			}
	  			if((i>0) && (i>0) && (i<cellsInRow-1)) {
						if((cells[curIndex]['empty'])
	  					&& (!cells[curIndex - cellsInRow]['empty']) 
	  					&& (!cells[curIndex + cellsInRow]['empty'])
	  					&& (!cells[curIndex - 1]['empty'])
	  					&& (!cells[curIndex - cellsInRow - 1]['empty'])
	  					&& (!cells[curIndex + cellsInRow - 1]['empty'])) {
		  					cells[curIndex]['disabled'] = true;
		  					$('.cross-cell').eq(curIndex).addClass('disabled');
	  				}
	  			}
	  			if((i<cellsInRow-1) && (i>0) && (i<cellsInRow-1)) {
						if((cells[curIndex]['empty'])
	  					&& (!cells[curIndex - cellsInRow]['empty'])
	  					&& (!cells[curIndex + cellsInRow]['empty'])
	  					&& (!cells[curIndex + 1]['empty'])
	  					&& (!cells[curIndex - cellsInRow + 1]['empty'])
	  					&& (!cells[curIndex + cellsInRow + 1]['empty'])) {
		  					cells[curIndex]['disabled'] = true;
		  					$('.cross-cell').eq(curIndex).addClass('disabled');
	  				}
	  			}


	  			if((i>0) && (i<cellsInRow-1) && (j>0) && (j<cellsInRow-1)) {
	  				if((cells[curIndex]['empty'])
	  					&& (!cells[curIndex+cellsInRow]['empty'])
	  					&& (!cells[curIndex+1]['empty'])
	  					&& (!cells[curIndex + cellsInRow + 1]['empty'])
	  					&& (!cells[curIndex-cellsInRow+1]['empty'])
	  					&& (!cells[curIndex+cellsInRow-1]['empty'])) {
	  						cells[curIndex]['disabled'] = true;
		  					$('.cross-cell').eq(curIndex).addClass('disabled');
	  					}

	  				if((cells[curIndex]['empty'])
	  					&& (!cells[curIndex+cellsInRow]['empty'])
	  					&& (!cells[curIndex-1]['empty'])
	  					&& (!cells[curIndex + cellsInRow - 1]['empty'])
	  					&& (!cells[curIndex+cellsInRow+1]['empty'])
	  					&& (!cells[curIndex-cellsInRow-1]['empty'])) {
	  						cells[curIndex]['disabled'] = true;
		  					$('.cross-cell').eq(curIndex).addClass('disabled');
	  					}

	  				if((cells[curIndex]['empty'])
	  					&& (!cells[curIndex-cellsInRow]['empty'])
	  					&& (!cells[curIndex+1]['empty'])
	  					&& (!cells[curIndex - cellsInRow - 1]['empty'])
	  					&& (!cells[curIndex-cellsInRow+1]['empty'])
	  					&& (!cells[curIndex+cellsInRow+1]['empty'])) {
	  						cells[curIndex]['disabled'] = true;
		  					$('.cross-cell').eq(curIndex).addClass('disabled');
	  					}

	  				if((cells[curIndex]['empty'])
	  					&& (!cells[curIndex-cellsInRow]['empty'])
	  					&& (!cells[curIndex-1]['empty'])
	  					&& (!cells[curIndex - cellsInRow - 1]['empty'])
	  					&& (!cells[curIndex+cellsInRow-1]['empty'])
	  					&& (!cells[curIndex-cellsInRow+1]['empty'])) {
	  						cells[curIndex]['disabled'] = true;
		  					$('.cross-cell').eq(curIndex).addClass('disabled');
	  					}

	  			}
	  		}
	  	}
  	}

  	// Обновление списка вопросов
  	// editEnable - параметр доступности вопросов для редактирования
  	// (для администрирования - доступен, для игрового режима - нет)
  	function updateQuestions(editEnable) {
  		$('.cross-questions__item').remove();

  		// Просматриваем все ячейки, в которых проставлен номер
  		$('.cross-cell__num').each(function(index) {
	  		$(this).text(index+1);
	  		var curIndex = $(this).data('cellindex');

	  		var questionWrap = '<textarea class="input crossword-input cross-questions__item-desc" placeholder="Введите вопрос"></textarea>';
	  		if(!editEnable)
	  			questionWrap = '<div class="cross-questions__item-desc"></div>';
	  		
	  		cells[curIndex]['number'] = index + 1;
	  		var item = '<li class="cross-questions__item" data-cellindex="' + curIndex + '">\
                          <div class="cross-questions__item-pos">\
                            <span class="cross-questions__item-number">' + (index+1) + '</span>\
                          </div>\
                          <div class="cross-questions__item-txt">' + questionWrap + '</div>\
                        </li>';         

        // Если в ячейке начинается горизонтальное слово, добавляем input в секцию по горизонтали
	  		if(cells[curIndex]['isHorizontal'] == true) {
	  			$('.cross-questions__block-wrap.horizontal')
	  					.find('.cross-questions__list').append(item);
	  			// Если для данного слово был заполнен вопрос, вставляем его
	  			$('.cross-questions__block-wrap.horizontal')
	  					.find('.cross-questions__item[data-cellindex="' + curIndex + '"]')
	  					.find('.cross-questions__item-desc')
	  					.text(cells[curIndex]['taskHorizontal']);
	  		}
	  		// Если в ячейке начинается вертикальное слово, добавляем input в секцию по вертикали
	  		if(cells[curIndex]['isVertical'] == true) {
	  			$('.cross-questions__block-wrap.vertical')
	  					.find('.cross-questions__list').append(item);
	  			// Если для данного слово был заполнен вопрос, вставляем его
	  			$('.cross-questions__block-wrap.vertical')
	  					.find('.cross-questions__item[data-cellindex="' + curIndex + '"]')
	  					.find('.cross-questions__item-desc')
	  					.text(cells[curIndex]['taskVertical']);
	  		}
	  	})
  	}


  	// Ввод значения в ячейку
  	function cellInput() {
  		$(document).on('keyup', '.cross-cell__input', function(e) {
  			var newIndex = -1;
				// Стрелки навигации
				if(e.which>=37 && e.which <= 40) {
					var curIndex = $(this).closest('.cross-cell').index();
					// Стрелка влево
					if(e.which == 37) {
						newIndex = curIndex-1;
					}
					// Стрелка вправо
					else if(e.which == 39) {
						newIndex = curIndex + 1;
					}
					// Стрелка вверх
					else if(e.which == 38) {
						newIndex = curIndex - cellsInRow;
					}
					// Стрелка вниз
					else if(e.which == 40) {
						newIndex = curIndex + cellsInRow;
					}

					// Если новая позиция попадает на поле, переносим курсор
					if(newIndex >= 0 && newIndex <= cells.length) {
						if(cells[newIndex]['empty'])
							$('.cross-cell').eq(newIndex).trigger('click');
						else
							$('.cross-cell').eq(newIndex).find('.cross-cell__input').trigger('focus');			
					}
				}
  			// Если ячейка является буквой кириллического алфавита
	    	else if ((e.which <= 90 && e.which >= 65) || (whichArr.indexOf(e.which)>=0)) {
	    		$(this).val(e.key);
	    		// После ввода значения сохраняем все ячейки
	    		saveAllCells();
	    	}
	    });
  	}

  	// Клик по ячейке
  	function cellClick() {
			$('.cross-cell').on('click', function() {
				// Добавляем input и выставляем в него фокус, если ячейка доступна
	    	if(!$(this).hasClass('disabled')) {
	    		if(!$(this).find('.cross-cell__input').length) {
		    		$(this).append(input);
		    		$(this).find('.cross-cell__input').trigger('focus');
		    	}
	    	}    	
	    });
  	}

  	// Перевод фокуса с ячеек
  	function loseFocusCell() {
			$(document).on('focusout', '.cross-cell__input', function(e) {
				// Если ячейка не была заполнена перед перемещением фокуса, input удаляется
	    	if($(this).val().trim() == '') {
	    		$(this).remove();
	    		saveAllCells();
	    	}
	    });
  	}

  	// Добавление вопроса
  	function addDesc() {
			$(document).on('keyup', '.cross-questions__item-desc', function() {
	    	var index = $(this).closest('.cross-questions__item').data('cellindex');
	    	// Сохранение вопроса в ячейку сразу после ввода
	    	if($(this).closest('.cross-questions__block-wrap').hasClass('horizontal')) {
	    		cells[index]['taskHorizontal'] = $(this).val();
	    	} else {
	    		cells[index]['taskVertical'] = $(this).val();
	    	}
	    })
  	}

  	// Подсветка ячеек при вводе описания
  	function hightlightCellsAdmin() {
		$(document).on('focus', '.cross-questions__item-desc', function() {
	    	var index = $(this).closest('.cross-questions__item').data('cellindex');
	    	$('.cross-cell').eq(index).find('.cross-cell__input').addClass('active');
	    	// Если в фокусе вопрос по горизонтали, выделяем все ячейки, соответствующие этому слову
	    	if($(this).closest('.cross-questions__block').hasClass('horizontal')) {
	    		var curCellIndex = cells[index]['posX'];
	    		for(var i =index; i< index + cellsInRow - curCellIndex; i++) {
	    			if(cells[i]['empty'] == false)
	    				$('.cross-cell').eq(i).find('.cross-cell__input').addClass('active');
	    			else
	    				return;
	    		}
	    	}
	    	// Если в фокусе вопрос по вертикали, выделяем все ячейки, соответствующие этому слову
	    	else {
	    		for(var i =index; i< cellsInRow*cellsInRow; i=i+cellsInRow) {
	    			if(cells[i]['empty'] == false)
	    				$('.cross-cell').eq(i).find('.cross-cell__input').addClass('active');
	    			else
	    				return;
	    		}
	    	}
	    });
  	}

  	// Перевод фокуса с ввода описания
  	function loseFocusDesc() {
  		$(document).on('focusout', '.cross-questions__item-desc', function() {
	    	// var index = $(this).closest('.cross-questions__item').data('cellindex');
	    	$('.cross-cell__input').removeClass('active');
	    });
  	}

  	// Подсветка строки
  	// index - номер выделенной ячейки
  	function hightlightRow(index) {
  		// Инициализация выбранного слова
  		selectedWord['cells'] = [];
  		selectedWord['horizontal'] = true;
  		// Позиция выбранной ячейки по горизонтали
			var curCellIndex = cells[index]['posX'];
			// Перебираем ячейки вправо до первой незаполненной и добавляем их в выделенное слово
			for(var i =index; i< index + cellsInRow - curCellIndex; i++) {
  			if(cells[i]['empty'] == false) {
  				$('.cross-cell').eq(i).find('.cross-cell__input').addClass('active');
  				selectedWord['cells'].push(i);
  			}
  			else
  				break;
  		}
  		// Перебираем ячейки влево до первой незаполненной и добавляем их в выделенное слово
  		for(var i = index-1; i>= index - curCellIndex; i--) {
  			if(cells[i]['empty'] == false) {
  				$('.cross-cell').eq(i).find('.cross-cell__input').addClass('active');
  				selectedWord['cells'].push(i);
  			}
  			else
  				break;
  		}
  		// Сортировка индексов ячеек выбранного слова по возрастанию
  		selectedWord['cells'].sort(sortNumber);
  	}

  	// Корректная сортировка чисел
  	function sortNumber(a,b) {
		   return a - b;
		}

  	// Подсветка столбика
  	function highlightColumn(index) {
  		// Инициализация выбранного слова
  		selectedWord['cells'] = [];
  		selectedWord['horizontal'] = false;
  		// Позиция выбранной ячейки по вертикали
			var curCellIndex = cells[index]['posY'];
			// Перебираем ячейки вниз до первой незаполненной и добавляем их в выделенное слово
			for(var i = index; i< cellsInRow * cellsInRow; i=i+cellsInRow) {
  			if(cells[i]['empty'] == false) {
  				$('.cross-cell').eq(i).find('.cross-cell__input').addClass('active');
  				selectedWord['cells'].push(i);
  			}
  			else
  				break;
  		}
  		// Перебираем ячейки вверх до первой незаполненной и добавляем их в выделенное слово
  		for(var i = index-cellsInRow; i >= 0; i=i-cellsInRow) {
  			if(cells[i]['empty'] == false) {
  				$('.cross-cell').eq(i).find('.cross-cell__input').addClass('active');
  				selectedWord['cells'].push(i);
  			}
  			else
  				break;
  		}
  		// Сортировка индексов ячеек выбранного слова по возрастанию
  		selectedWord['cells'].sort(sortNumber);
  	}

  	// Подсветка ячеек в игре
  	function hightlightCellsGame() {
  		// При клике по номеру ячейки перевод фокуса на input
  		$(document).on('click', '.cross-cell__num.game', function() {
  			$(this).closest('.cross-cell').find('.cross-cell__input.game').trigger('click').trigger('focus');
  		})

  		$(document).on('click', '.cross-cell__input.game', function() {
  			// При клике по ячейке очищаем выделение ячеек и вопросов
  			$('.cross-cell__input.game').removeClass('active');
  			$('.cross-questions__item-number').removeClass('active');
  			var index = $(this).closest('.cross-cell').index();
  			
  			$(this).addClass('active');
  			// Если данная ячейка принадлежит одновременно горизонтальному и вертикальному слову,
  			// при клике сменяем одно выделенное слово на другое
  			if((selectedWord['cells'].indexOf(index) >= 0) && ($(this).closest('.cross-cell').hasClass('horizontal vertical'))) {
  				if(selectedWord['horizontal'])
  					highlightColumn(index);
  				else
  					hightlightRow(index);
  			}
  			// Иначе если в данной ячейке начинается горизонтальное слово, выделяем его
  			else if(cells[index]['isHorizontal']) {
					hightlightRow(index);
				}
				// Иначе если в данной ячейке начинается вертикальное слово, выделяем его
				else if(cells[index]['isVertical']) {
					highlightColumn(index);
  			}
  			// Иначе если данная ячейка является частью горизонтального слова, выделяем его
  			else if($(this).closest('.cross-cell').hasClass('horizontal')) {
  				hightlightRow(index);
  			}
  			// Иначе если данная ячейка является частью вертикального слова, выделяем его
  			else if($(this).closest('.cross-cell').hasClass('vertical')) {
  				highlightColumn(index);
  			}

  			// Для выделенного слова выделяем соответствующий вопрос
  			if(selectedWord['horizontal']) {
  				$('.cross-questions__block.horizontal')
  					.find('.cross-questions__item[data-cellindex=' + selectedWord['cells'][0] + ']')
  					.find('.cross-questions__item-number').addClass('active');
  			} else {
  				$('.cross-questions__block.vertical')
  					.find('.cross-questions__item[data-cellindex=' + selectedWord['cells'][0] + ']')
  					.find('.cross-questions__item-number').addClass('active');
  			}  			

  		})
  	}

  	// Перевод фокуса с ячейки (не используется)
  	function loseFocusCellsGame() {
			$(document).on('focusout', '.cross-cell__input.game', function() {
	    	// var index = $(this).closest('.cross-cell').data('cellindex');
	    	//$('.cross-cell__input.game').removeClass('active');
	    });
  	}

  	// Сохранение кроссворда в файл
  	function saveCross() {
  		$('.crossword-info__create-btn').on('click', function(e) {
  			e.preventDefault();

  			for(var i = 0; i< cellsInRow; i++) {
		  		for(var j = 0; j<cellsInRow; j++) {
		  			var curIndex = j + cellsInRow * i;
		  			// Если ячейка пустая, очищаем всё лишнее
		  			if(cells[curIndex]['empty']) {
		  				cells[curIndex]['disabled'] = true;
		  				cells[curIndex]['letter'] = '';
			  			cells[curIndex]['number'] = '';
			  			cells[curIndex]['isHorizontal'] = false;
			  			cells[curIndex]['isVertical'] = false;
			  			cells[curIndex]['horizontalWord'] = false;
			  			cells[curIndex]['verticalWord'] = false;
			  			cells[curIndex]['taskHorizontal'] = '';
			  			cells[curIndex]['taskVertical'] = '';
		  			}

		  			// Заполняем признак принадлежности ячейки горизонтальному слову
		  			if(j<cellsInRow-1) {
		  				if((!cells[curIndex]['empty']) && (!cells[curIndex + 1]['empty'])) {
		  					cells[curIndex]['horizontalWord'] = true;
		  					cells[curIndex + 1]['horizontalWord'] = true;
		  				}
		  			}
		  			// Заполняем признак принадлежности ячейки вертикальному слову
		  			if(i<cellsInRow-1) {
		  				if((!cells[curIndex]['empty']) && (!cells[curIndex + cellsInRow]['empty'])) {
		  					cells[curIndex]['verticalWord'] = true;
		  					cells[curIndex + cellsInRow]['verticalWord'] = true;
		  				}
		  			}
		  		}
		  	}

		  	// Сохранение кроссворда в файл
  			var data = {};
  			data['id'] = '1';
  			data['title'] = $('#crossword-caption').val();
  			data['desc'] = $('#crossword-desc').val();
  			data['cells'] = cells;

				var json = JSON.stringify(data);
				var blob = new Blob([json], {type: "application/json"});
				var url  = URL.createObjectURL(blob);

				var a = document.createElement('a');
				a.download    = "crossword.json";
				a.href        = url;
				a.click();

  		})
  	}


  	// Загрузка списка кроссвордов для выбора
  	function loadCrossList() {
  		$('.select-cross__item').remove();
  		for(var i = 0; i<crosswords.length; i++) {
  			var cross = crosswords[i],
  					crossTitle = crosswords[i]['title'],
  					crossDesc = crosswords[i]['desc'];

  			var item = '<li class="select-cross__item">\
                      <div class="select-cross__item-wrap">\
                        <span class="select-cross__num">' + (i+1) + '.</span>\
                        <div class="select-cross__info">\
                          <a href="#" class="select-cross__caption">' + crossTitle + '</a>\
                          <div class="select-cross__desc">' + crossDesc + '</div>\
                        </div>\
                      </div>\
                    </li>';

        $('.select-cross__list').append(item);
  		}
  	}

  	// Инициализация ячеек для игры
  	function initCellsGame() {
  		$('.cross-cell, .cross-questions__item').remove();

			for(var i = 0; i< cellsInRow; i++) {
	  		for(var j = 0; j<cellsInRow; j++) {
	  			var curIndex = j + cellsInRow * i,
	  					curCell,
	  			// Класс недоступной ячейки
	  					transparentClass = '',
	  			// Класс направления слова в ячейке
	  					directionClass = '';
	  			if(cells[curIndex]['disabled'])
	  				transparentClass = ' transparent';	 
	  			if(cells[curIndex]['horizontalWord'])
	  					directionClass+=' horizontal';
	  			if(cells[curIndex]['verticalWord'])
	  					directionClass+=' vertical';

	  			// Добавление ячеек на поле
	  			if(i<cellsInRow-1)
	  				$('.crossword-field').append('<div class="cross-cell' + transparentClass + directionClass + '"></div>');
	  			else
	  				$('.crossword-field').append('<div class="cross-cell last-row ' + transparentClass + directionClass + '"></div>');

	  			curCell = $('.cross-cell').eq(curIndex);

	  			// Если ячейка не пустая, добавляется input
	  			if(!cells[curIndex]['empty']) {
	  				curCell.append(input);
	  				curCell.find('.cross-cell__input').addClass('game');
	  				// Если в ячейке есть номер, добавляем его
	  				if(cells[curIndex]['number']) {
	  					curCell.append(number);
	  					curCell.find('.cross-cell__num').data('cellindex', curIndex).addClass('game');
	  					curCell.find('.cross-cell__num').text(cells[curIndex]['number']);	  					
	  				} 				
	  			}
	  		}
	  	}
	  	updateQuestions(false);
  	}

  	// Заполнение кроссворда
  	function fillCrossword() {
			$(document).on('keyup', '.cross-cell__input.game', function(e) {
				var newIndex = -1;
				// Стрелки навигации
				if(e.which>=37 && e.which <= 40) {
					var curIndex = $(this).closest('.cross-cell').index();
					// Стрелка влево
					if(e.which == 37) {
						newIndex = curIndex-1;
					}
					// Стрелка вправо
					else if(e.which == 39) {
						newIndex = curIndex + 1;
					}
					// Стрелка вверх
					else if(e.which == 38) {
						newIndex = curIndex - cellsInRow;
					}
					// Стрелка вниз
					else if(e.which == 40) {
						newIndex = curIndex + cellsInRow;
					}

					// Если новая позиция попадает на поле и содержит букву, переносим курсор
					if(newIndex >= 0 && newIndex <= cells.length) {
						if(!cells[newIndex]['empty'])
							$('.cross-cell').eq(newIndex).find('.cross-cell__input.game').trigger('focus');
						if(selectedWord['cells'].indexOf(newIndex) < 0 )
							$('.cross-cell').eq(newIndex).find('.cross-cell__input.game').trigger('click');
					}
				}				
				// Буквы русского алфавита
				else if ((e.which <= 90 && e.which >= 65) || (whichArr.indexOf(e.which)>=0)) {
	    		$(this).val(e.key);
	    		// Если это не последняя буква слова, переносим курсор после ввода
	    		var index = selectedWord['cells'].indexOf($(this).closest('.cross-cell').index());
	    		if(index < selectedWord['cells'].length-1) {
	    			$('.cross-cell').eq(selectedWord['cells'][index+1])
	    					.find('.cross-cell__input.game').trigger('focus');
	    		}
	    		checkCrossword();	    		
	    	}				
	    });
  	}

  	// Проверка кроссворда на корректность
  	function checkCrossword() {
  		// Перебор всех ячеек на совпадение с корректными значениями	    		
  		for(var i = 0; i< cellsInRow; i++) {
	  		for(var j = 0; j<cellsInRow; j++) {
	  			var curIndex = j + cellsInRow * i,
	  					curCell = $('.cross-cell').eq(curIndex);
	  			if(!cells[curIndex]['empty']) {
						if(cells[curIndex]['letter'].toUpperCase() != curCell.find('.cross-cell__input').val().toUpperCase()) {									
							return;
						}
	  			}			  			
	  		}
	  	}
	  	// Если все ячейки совпадают, завершение игры
	  	endGame(false);
  	}

  	

  	// Конец игры
  	function endGame(isGiveUp) {
			stopTimer(isGiveUp);
			$('.cross-popup-overlay').show();
			if(isGiveUp) {
        $('.cross-popup-giveup').show();
    	} else {
        $('.cross-popup-end').show();
    	}
  	}

  	// Разгадывание выбранного кроссворда
  	function playCrossword(index) {
  		curCross = crosswords[index];
  		$('.play-cross__title').text(curCross['title']);
  		cells = curCross['cells'];
  		initCellsGame();
  		startTimer();
  		hightlightCellsGame();
  		loseFocusCellsGame();
  		fillCrossword();
  		giveup();
  		playAgain();
  	}

  	// Начать игру заново
  	function playAgain() {
  		$('.play-again').on('click', function(e) {
  			e.preventDefault();
				$('.cross-popup-overlay, .cross-popup-end, .cross-popup-giveup').hide();
				$('.select-cross').removeClass('hidden');
				$('.play-cross').addClass('hidden');
  		})
  	}

  	// Сдаться
  	function giveup() {
  		$('.btn-giveup').on('click', function(e) {
  			e.preventDefault();
  			endGame(true);
  		})
  	}

  	// Начало игры
  	function startGame() {
			$(document).on('click', '.select-cross__caption', function(e) {
				e.preventDefault();
				$('.select-cross').addClass('hidden');
				$('.play-cross').removeClass('hidden');
				var index = $(this).closest('.select-cross__item').index();
				playCrossword(index);
			});
  	}  	
  	
		
  	// Администрирование
  	if($('.crossword-admin').length) {

  		$(".cross-questions__block-wrap").mCustomScrollbar();
  		initCellsAdmin();	
	  	cellInput();
	  	cellClick();
	  	loseFocusCell();
	  	addDesc();
	  	hightlightCellsAdmin();
	  	loseFocusDesc();
	  	saveCross();

  	} 
  	// Игра
  	else if($('.crossword-game').length) {

			$(".select-cross__list-wrap").mCustomScrollbar();
			loadCrossList();
			$(".cross-questions__block-wrap").mCustomScrollbar();
			startGame();

  	}
  	


  });

})(jQuery, window, document);
