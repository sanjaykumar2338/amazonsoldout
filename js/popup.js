var _apiUrl = "https://www.amazonsoldout.com/";
$(document).ready(function() {	

	//define scrap function
	var startScrap = function(url) { 	
	 	$.get(url, item => { 	   	 		
	 	    var asins = [];
	 	    //Get ASIN of li found on page
	        $(item).find('li').each(function(){		  	
	       		var asin = $(this).find("div").data("asin");       		
	       		asins.push(asin);	
		    });
		
			$(item).find('li').each(function(){		   
				  	var data = $(this).find('div').data('p13n-asin-metadata')	
				  	if(data){ 	  	
				  		asins.push(data.asin);				  		
				 	}
			});		  	

			$(item).find('li').each(function(){		   
				  	var data = $(this).find('div').data('p13n-asin-metadata')	
				  	if(data){ 	  	
				  		asins.push(data.asin);				  		
				 	}
			});		

			if($(item).length > 0){
				asins.push($('#ftSelectAsin').val());				
			}  	
			
			//Get ASIN of amazon homepage 
			$(item).find('.feed-carousel-shelf li').each(function(){		 
			  if($(this).data("asin") != '') {       		
	       		var data = $(this).data("sgproduct");		       		       		       		
	       		if(data != undefined){       			
	   			   asins.push(data.asin);
	       		}
	    	  }	
			});



	    	if(url){
				var a = url.split('dp/');		  
				if(a && a[1]){
			  		var b = a[1].split('/ref');
				  	if(b && b[0]){
				  	 asins.push(b[0]);		  
				    }
			    }
			 }



			$(item).find('.a-carousel li').each(function(){
			  var href = $(this).find('a').attr('href');
			  if(href){
				var a = href.split('product/');		  
				if(a && a[1]){
			  	 var b = a[1].split('/ref');
			  	if(b && b[0]){
			  	 asins.push(b[0]);		  
			    }
			    }
			  }
			});

	       	$(item).find('#s-results-list-atf li').each(function(){
	       	if($(this).data("asin") != '') {       	
	       		asins.push($(this).data("asin"));		
	    	  }	    	   
			}); 
			       	
	       	asins = $.unique(asins);
	       	displayDataInTable(asins);
		})	
	}

	//Get save url where data to fetch
	var url = localStorage.getItem('currentURL'); 
		
	//Default scrap page
	if(!url){
		url = 'https://www.amazon.com/ref=nav_logo';
	}	

	//calling scrap function
	startScrap(url);

	//append loader for the new content
	var appendLoader = function(){
		$("#main-table tbody").html('');					
	  			var tr ='<tr>';
	                tr +='<td colspan="16" style="text-align:center;">';
	                tr +='<img height="150" width="150" src="../images/loaders.svg"></td>';  
	                tr +='</tr>';	        
		$("#main-table tbody").append(tr); 	
	}

	//no result found message	
	var noResultFound = function(){
		$("#main-table tbody").html('');					
	  			var tr ='<tr>';
	                tr +='<td colspan="16" style="text-align: center;">';
	                tr +='No Record Found.</td>';  
	                tr +='</tr>';	        
		$("#main-table tbody").append(tr); 	
	}

	//Render data to popup html
	function displayDataInTable(asins){   				
			appendLoader();			

			var sale_rank_total = 0;
			var total_sale_rank = 0;

	  		var num = 1;
			$.ajax({
		        type: "get",	        
		        url: _apiUrl+"index.php?type=productInfo",
		        data: {asin: asins},  	        
		        success: function (responseJson) {	        		
		           		productInfos = $.parseJSON(responseJson);
		           		$("#main-table tbody").html('');

						$.each(productInfos.all_products, function(k, productInfo) {
					     if(productInfo.asin != ''){
					     	var rating = '<img src="../images/loader-upload_ajax.gif">';
					     	var review_count = '<img  src="../images/loader-upload_ajax.gif">';		

					     	if(productInfo.sale_rank != 'N/A'){
					     		sale_rank_total = sale_rank_total + parseInt(productInfo.sale_rank);						     		    	
					     		total_sale_rank = k + 1;
					     		var total = sale_rank_total / total_sale_rank;					     		
					     	}

							var tr = '';
							var tr = '<tr>';
							tr += '<td><b>'+num+'.</b></td>';
							tr += '<td>'+productInfo.asin+'</td>';
							tr += '<td class="productNameCol">'+'<a target="_blank" href="'+productInfo.link+'" title="'+productInfo.title+'"> '+productInfo.title.substring(0,15)+'</a></td>';	
							tr += '<td><img style="width: 50px;height:30px;" src="'+productInfo.product_image+'"></td>';
							tr += '<td>'+productInfo.brand+'</td>';
							tr += '<td>'+productInfo.formattedPrice+'</td>';						
							tr += '<td>'+productInfo.publisher+'</td>';						
							tr += '<td><a title="'+productInfo.warranty+'">'+productInfo.warranty.substring(0,10)+'</td>';
							tr += '<td>'+productInfo.currencyCode+'</td>';	
							tr += '<td>'+productInfo.sale+'</td>';						
							tr += '<td>'+productInfo.est_sale+'</td>';						
							tr += '<td>'+productInfo.sale_rank+'</td>';	
							tr += '<td>'+productInfo.fba_fees+'</td>';		
							tr += '<td class="ratingCol">'+rating+'</td>';		
							tr += '<td class="reviewCountCol">'+review_count+'</td>';		
							tr +='<td><a title="'+productInfo.category+'">'+productInfo.category.substring(0,10)+'</td>';						
							tr += '</tr>';

							num++;						
							$("#main-table tbody").append(tr);	
							$('#total_records').html(num-1);
						} 	
					});	

					var total_rec = $('#main-table tbody tr').length;
					
					var total_sales_rank = sale_rank_total/total_rec;	
					$('#avg_sale_rank').text(total_sales_rank.toFixed(0)); 

					getReviewAndRating(total_rec);	
					if(total_rec > 0){
						getSearchOption();						
					}else{
						noResultFound();
					}	

		        },error: function (data) {
		           console.log(data);
		           console.log(data.Message);
		    	}
		    });  	   
	  	}


	//get review and rating
	var getReviewAndRating = function(total_sale_rank){
	var sum_of_review = 0;
   	var review_count = 0;

   	var sum_of_rating = 0;
   	var rating_count = 0;	

   	var i = 1;
    $("#main-table tbody").find('tr').each(function(){
    	var url = $(this).find('.productNameCol a').attr('href');
    	var _that = $(this);  

		$.ajax({
		    url : url,
		    type : "get",		    
		    success : function(item) {
		    	var c = '';
		    	var v = '';
			    c = $(item).find('#averageCustomerReviews .a-icon-alt').text();
				v = $(item).find('#acrCustomerReviewText').first().text();
				rating_r = v.match(/\d+/);
				
				var review_count_c = '';
				if(c){			
					review_count_c = parseFloat(c.match(/-?(?:\d+(?:\.\d*)?|\.\d+)/)[0]);	
				}			

				if (rating_r == null){
					rating_r = 'N/A';	
				}else{
					sum_of_review += parseInt(rating_r);	
					var avg = sum_of_review/total_sale_rank;
					$('#avg_reviews').text(avg.toFixed(0));				
   					review_count = parseInt(review_count) + parseInt(i);
				}

				if(review_count_c == ''){
					review_count_c = 'N/A';				
				}else{
					sum_of_rating += parseFloat(review_count_c);
					var avg = sum_of_rating/total_sale_rank;
					$('#avg_rating').text(avg.toFixed(1));	
   					rating_count = parseInt(rating_count) + parseInt(i);	
				}

				 i++;
				_that.find('.ratingCol').text(review_count_c);								
				_that.find('.reviewCountCol').text(rating_r);	


				console.log('sum_of_rating',sum_of_rating.toFixed(1),'rating_count',rating_count);	
	   			console.log('sum_of_review',sum_of_review,'review_count',review_count);	
		    },							
		 });
	   })	   
	}  	


	//Jquery sortorder lib
	var getSearchOption = function() { 
	  var $table = $('#main-table').tablesorter({    
	    widgets: ["zebra", "filter"],
	    widgetOptions : {      
	      filter_external : '.search',      
	      filter_defaultFilter: { 1 : '~{query}' },      
	      filter_columnFilters: true,
	      filter_placeholder: { search : 'Search...' },
	      filter_saveFilters : true,
	      filter_reset: '.reset'
	    }
	  });
	  $('.tablesorter-filter-row').hide();
	}


	//destroy sortorder from table
	var destroySortOrder = function(tablenameid){
		$("#"+tablenameid).trigger("destroy");
	}

	// export to csv file
	$(document).on('click', '#export-csv', function(e){
	  e.preventDefault();

	  var titles = [];
	  var data = [];

	  /*
	   * Get the table headers, this will be CSV headers
	   * The count of headers will be CSV string separator
	   */
	  $('.dataTable th').each(function() {
	    titles.push($(this).text());
	  });

	  /*
	   * Get the actual data, this will contain all the data, in 1 array
	   */
	  $('.dataTable td').each(function() {
	    data.push($(this).text());
	  });
	  
	  /*
	   * Convert our data to CSV string
	   */
	  var CSVString = prepCSVRow(titles, titles.length, '');
	  CSVString = prepCSVRow(data, titles.length, CSVString);

	  /*
	   * Make CSV downloadable
	   */
	  var downloadLink = document.createElement("a");
	  var blob = new Blob(["\ufeff", CSVString]);
	  var url = URL.createObjectURL(blob);
	  downloadLink.href = url;
	  var dt = new Date();
	  downloadLink.download = "record_"+dt+"_data.csv";

	  /*
	   * Actually download CSV
	   */
	  document.body.appendChild(downloadLink);
	  downloadLink.click();
	  document.body.removeChild(downloadLink);
	});

	   /*
	* Convert data array to CSV string
	* @param arr {Array} - the actual data
	* @param columnCount {Number} - the amount to split the data into columns
	* @param initial {String} - initial string to append to CSV string
	* return {String} - ready CSV string
	*/
	function prepCSVRow(arr, columnCount, initial) {
	  var row = ''; // this will hold data
	  var delimeter = ','; // data slice separator, in excel it's `;`, in usual CSv it's `,`
	  var newLine = '\r\n'; // newline separator for CSV row

	  /*
	   * Convert [1,2,3,4] into [[1,2], [3,4]] while count is 2
	   * @param _arr {Array} - the actual array to split
	   * @param _count {Number} - the amount to split
	   * return {Array} - splitted array
	   */
	  function splitArray(_arr, _count) {
	    var splitted = [];
	    var result = [];
	    _arr.forEach(function(item, idx) {
	      if ((idx + 1) % _count === 0) {
	        splitted.push(item);
	        result.push(splitted);
	        splitted = [];
	      } else {
	        splitted.push(item);
	      }
	    });
	    return result;
	  }
	  var plainArr = splitArray(arr, columnCount);
	  // don't know how to explain this
	  // you just have to like follow the code
	  // and you understand, it's pretty simple
	  // it converts `['a', 'b', 'c']` to `a,b,c` string
	  plainArr.forEach(function(arrItem) {
	    arrItem.forEach(function(item, idx) {
	      row += item + ((idx + 1) === arrItem.length ? '' : delimeter);
	    });
	    row += newLine;
	  });
	  return initial + row;
	 }

	//open a link of search web page
	$(document).on('click', '#get-link', function(e){		
		e.preventDefault();
		var url = localStorage.getItem('currentURL'); 
		window.open(url);
	 });

	// Increase Font Size
	$(document).on('click', '.act-font-plus',function(){
	  var currentSize = $('.dataTable td').css('font-size');
	  var currentSize = parseFloat(currentSize)*1.2;
	  $('.dataTable td').css('font-size', currentSize);
	});

	// Decrease Font Size
	$(document).on('click', '.act-font-minus',function(){
	  var currentFontSize = $('.dataTable td').css('font-size');
	  var currentSize = $('.dataTable td').css('font-size');
	  var currentSize = parseFloat(currentSize)*0.8;
	  $('.dataTable td').css('font-size', currentSize);
	});

	//toggle filter search boxes
	$(document).on('click','#filter',function(){
		$('.tablesorter-filter-row').toggle();
	});

	//read file content when uploaded
	$(function() {
		var fileInput = document.getElementById("filefromcsv"),
		readFile = function () {
		        var reader = new FileReader();
		        reader.onload = function () {		        	
		            document.getElementById('ipt-list-asin').innerHTML = reader.result;
		        };
		        // start reading the file. When it is done, calls the onload event defined above.
		        reader.readAsBinaryString(fileInput.files[0]);
		};

		fileInput.addEventListener('change', readFile);
	});

  

	//search list of asins
	$(document).on('click','#btn-search-asin', function(){
		val=document.getElementById('ipt-list-asin').value;

		val = val = val.replace(/(?:\r\n|\r|\n)/g, ',');
		var partsOfStr = val.split(',');

		var asins = [];				
		$.each(partsOfStr, function( index, value ) {
		  if(value && /^[a-z0-9\-]+$/i.test(value)){	
		  	asins.push(value);	
		  }
		});			

		if(asins.length == 0){
		  $('#myModal').modal('hide');
		  return;
		}

		destroySortOrder('main-table');

		$('#myModal').modal('hide');
		asins = $.unique(asins);		
       	displayDataInTable(asins);
	});
});

