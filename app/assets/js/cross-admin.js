(function ($, window, document, undefined) {

  'use strict';

  $(function () {


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

  	// Инициализация редактируемого кроссворда
  	function initEditedCross() {
			for(var i = 0; i< cellsInRow; i++) {
	  		for(var j = 0; j<cellsInRow; j++) {
	  			var curIndex = j + cellsInRow * i,
	  					curCell; 			
	  			if(i<cellsInRow-1)
	  				$('.crossword-field').append('<div class="cross-cell"></div>');
	  			else
	  				$('.crossword-field').append('<div class="cross-cell last-row"></div>');

	  			// Добавляем ячейку
	  			curCell = $('.cross-cell').eq(curIndex);

	  			// Если ячейка не пустая, добавляем input и букву
	  			if(!cells[curIndex]['empty']) {
	  				if(cells[curIndex]['letter'] != '') {
							curCell.append(input);
							curCell.find('.cross-cell__input').val(cells[curIndex]['letter']);
	  				}
	  				// Если в ячейке начинается слово, добавляем номер
	  				if(cells[curIndex]['number'] != '') {
	  					curCell.append(number);
							curCell.find('.cross-cell__num').data('cellindex', curIndex);
							curCell.find('.cross-cell__num').text(cells[curIndex]['number']);
	  				}  				
	  			}
	  		}
	  	}
	  	updateQuestions(true);
	  	checkDisabled();
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
  	}

  	// Очистка номера ячейки
  	function clearNumber(index) {
  		cells[index]['number'] = '';
			cells[index]['isHorizontal'] = false;
			cells[index]['isVertical'] = false;
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
	    	$('.cross-cell__input').removeClass('active');
	    });
  	}  	

  	// Корректная сортировка чисел
  	function sortNumber(a,b) {
		   return a - b;
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

		  	// Сохранение кроссворда
  			var data = {};

  			var id = getIdFromUrl(window.location.href);
  			if(id) {
  				data['id'] = id;
  			}
  			data['title'] = $('#crossword-caption').val();
  			data['desc'] = $('#crossword-desc').val();
  			data['cells'] = JSON.stringify(cells).replace('[','').replace(']','');

				$.ajax({
					url: 'mediacenter/krossvordyi/crosswordsaver.html',
					type: 'POST',
					data: data,
					success: function(res) {
						var result = jQuery.parseJSON(res);
						alert(result.msg);

						// Если результат успешный и кроссворд создан (пустой id),
						// то переходим на страницу редактирования
						if((!id) && (result.success)) {
							window.location.href = window.location.href + '?id='+result.id;
						}
					}
				})

  		})
  	}		


  	// Редактирование кроссворда
  	function crossEdit() {
  		cells = curCross['cells'];

			$('.crossword__title').text('Редактирование кроссворда');
  		$('#crossword-caption').val(curCross['title']);
  		$('#crossword-desc').val(curCross['desc']);
  		$('.btn.crossword-info__create-btn').text('Сохранить кроссворд');

  		$(".cross-questions__block-wrap").mCustomScrollbar();

			initEditedCross();	
			cellInput();
	  	cellClick();
	  	loseFocusCell();
	  	addDesc();
	  	hightlightCellsAdmin();
	  	loseFocusDesc();
	  	saveCross();
  	}

  	// Создание нового кроссворда
  	function createNewCross() {
  		$('.crossword__title').text('Создание кроссворда');
  		$('.btn.crossword-info__create-btn').text('Создать кроссворд');

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

  	// Получить id из url
  	function getIdFromUrl(urlStr) {
  		var url = new URL(urlStr);
  		var id = url.searchParams.get('id');
  		return id;
  	}

		
  	// Администрирование
  	if($('.crossword-admin').length) {
  		var id = getIdFromUrl(window.location.href);
  		if(id) {
				crossEdit(id);	
  		} else {
  			createNewCross(); 
  		}
  	}  	
  	


  });

})(jQuery, window, document);
