var _apiUrl = "https://www.amazonsoldout.com/";
$(document).ready(function() {		

	$(document).click(function(e){
		var container = $(".toggle_btn");
	    // if the target of the click isn't the container nor a descendant of the container
	    if (!container.is(e.target) && container.has(e.target).length === 0) 
	    {
	        $('#menu-options-column-number').hide();
	    }
	});

	//hide a default column
	var hideDefaultColumn = function(){
		//show default columns
		//key refer to class and value refer to ID
		var myArray = {srCol: 'hasPopup', asinCol: 'ASIN',parentAsinCol: 'ParentASIN',productNameCol:'Title',brandCol:'Brand',priceCol:'LowestRefurbishedPrice',publisherCol: 'ComposedRank',warrantyCol: 'Warranty',estimatedCol: 'EstSales',estimatedRevenueCol: 'EstRevenue',saleRankCol: 'SalesRank',fbaCol: 'FBATablefee',ratingCol: 'Rating',reviewCol: 'NumOfReviews',categoryCol: 'Category',imageCol:'Image',eanCol:'EAN',upcCol:'UPC',similarProductCol: 'SimilarProduct',studioCol:'Studio',manufacturerCol:'Manufacturer',numberSellerNewCol:'TotalNew',numberSellerUsedCol: 'TotalUsed',lowestPriceCol:'LowestNewPrice',numberSellerRefurbishedCol: 'TotalRefurbished',weightCol:'Weight',weightLbCol: 'WeightLB',bindingCol:'Binding',priceHistoryCol:'EvolutionPriceRank',partNumberCol:'PartNumber',packageQuantityCol: 'PackageQuantity',packageDimensionsCol:'PackageDimensions',editorialReviewCol: 'EditorialReview',mpnCol: 'MPN',fullSaleRankCol: 'fullsaleranks',languageCol:'Languages',releaseDateCol: 'ReleaseDate',publicationDateCol:'PublicationDate',authorCol:'Author',numberOfPagesCol:'NumberOfPages',formatCol:'Format',productGroupCol:'ProductGroup',isAadultProductCol:'IsAdultProduct',lowestUsedPriceCol:'LowestUsedPrice'};

		for (var key in myArray) {			
			if(!localStorage.getItem(key)){
				$('#'+myArray[key]).prop('checked', true);			
				$('.'+key).show();
			}else{	
				if(localStorage.getItem(key) == 'yes'){						
					$('#'+myArray[key]).prop('checked', true);			
					$('.'+key).show();
				}else {						
					$('#'+myArray[key]).prop('checked', false);
					$('.'+key).hide();
				}	
			}	
		}
			
	}

	hideDefaultColumn();


	//append loader for the new content
	var appendLoader = function(){
		$('#total_records').html('<img src="../images/loader-upload_ajax.gif">');
		$('#avg_sale_rank').html('<img src="../images/loader-upload_ajax.gif">');
		$('#avg_reviews').html('<img src="../images/loader-upload_ajax.gif">');
		$('#avg_rating').html('<img src="../images/loader-upload_ajax.gif">');		

	  			var tr ='<tr>';
	                tr +='<td colspan="19" style="text-align:center;">';
	                tr +='<img height="150" width="150" src="../images/loaders.svg"></td>';  
	                tr +='</tr>';	        
		$("#main-table tbody").html(tr); 	
	}


	//define scrap function
	var startScrap = function(url) { 
		appendLoader();	
		$.ajax({
		    type: "get",	        
	        url: url,
	        success: function (item) {	
	 	    var asins = [];	 

	 	    var text_box_val = $(item).find('#twotabsearchtextbox').val();	 	    
	 	    
	 	    if(text_box_val){
	 	    	$('#keyword_search').text(text_box_val);
	 		}else{
	 			$('#keyword_search').hide();
	 		}

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

			$(item).find('.zg_itemImmersion').each(function(){
          		var v = $(this).find('.zg_itemWrapper').find('div').attr('data-p13n-asin-metadata');
           		var json = $.parseJSON(v);           	
           		asins.push(json.asin);						
			});	

			var i;
			for (i = 0; i < 60; i++) { 
				if($(item).find('#result_14').length > 0){
			    	var asin = $(item).find('#result_'+i).data("asin"); 
			    	asins.push(asin);
				}
			}

	       	asins = $.unique(asins);
	       	displayDataInTable(asins);	       	
	    },error: function (jqXHR, exception) {
			      	var msg = handleError(jqXHR, exception);
			        httpError(msg);
			},
		})	
	}

	//get sale rank html
	function checkCategoryAndSalesrank(htmlSource) {	 
	        var productDetails = $(htmlSource).find("#productDetails_detailBullets_sections1").find("tr");
	        productDetails.each(function(){
	            if($.trim($(this).find("th").text()) === "Best Sellers Rank"){
	            	return $.trim($($(this).find("td")).html());	              	            	
	            }
	        });	    
	        return false;	    
	}	
	
	function getScrapURL(url){
		//Get save url where data to fetch
		var url = localStorage.getItem('currentURL'); 	
		//Default scrap page
		if(!url){
			url = 'https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Dtoys-and-games&field-keywords=baby';
		}
		
		return url;
	}

	//calling scrap function	
	var url = getScrapURL();
	startScrap(url);

	//no result found message	
	var noResultFound = function(){
		$('#total_records').text('');
		$('#avg_sale_rank').text('');
		$('#avg_reviews').text('');
		$('#avg_rating').text('');

		$("#main-table tbody").html('');					
	  			var tr ='<tr>';
	                tr +='<td colspan="19" style="text-align: center;">';
	                tr +='No Record Found.</td>';  
	                tr +='</tr>';	        
		$("#main-table tbody").append(tr); 	
	}

    //no result found message   
    var httpError = function(error){
    	$('#keyword_search').text('');
        $('#total_records').text('');
        $('#avg_sale_rank').text('');
        $('#avg_reviews').text('');
        $('#avg_rating').text('');

        $("#main-table tbody").html('');                    
                var tr ='<tr>';
                    tr +='<td colspan="19" style="text-align: center;">'+error+'</td>';                    
                    tr +='</tr>';           
        $("#main-table tbody").append(tr);  
    }

    //selection checkbox for bulk operations
    $(document).on('change','.line-selection', function(){

	        if($(this).is(":checked")) {
        		 $(this).closest('tr').addClass('active-line-cb');
	        }else{
	        	$(this).closest('tr').removeClass('active-line-cb');
	        }
    });

    //Operational popup ***************************************

    //hide / show popup
    $(document).on('click','.toggle_btn', function(){
    	$('#menu-options-column-number').toggle();	
    });  

    //hide menu popup
    var hideMenuPopup = function(){
    	$('#menu-options-column-number').hide();  
    }

    //show menu popup
    var showMenuPopup = function(){
    	$('#menu-options-column-number').show();  
    }

    //Select all
	$(document).on('click','.cn-select-all', function(e){
		e.preventDefault();				
		$("#main-table").find('tr').each(function(){
			$(this).addClass('active-line-cb');
			$(this).find('.line-selection').prop('checked',true);

			hideMenuPopup();
		});
    });

	//de-select all
    $(document).on('click','.cn-deselect-all', function(e){
		e.preventDefault();				
		$("#main-table").find('tr').each(function(){
			$(this).removeClass('active-line-cb');
			$(this).find('.line-selection').prop('checked',false);
			
			hideMenuPopup();
		});
    });

    //invert selection
    $(document).on('click','.cn-invert-selection', function(e){
		e.preventDefault();				
		$("#main-table").find('tr').each(function(){
			$(this).toggleClass('active-line-cb');
			
			if($(this).find('.line-selection').is(':checked')){
				$(this).find('.line-selection').prop('checked', false);
			}else{
				$(this).find('.line-selection').prop('checked', true);
			}

			hideMenuPopup();
		});
    });

    //delete selected
     $(document).on('click','.cn-delete-all-selected', function(e){
		e.preventDefault();				
		$("#main-table  > tbody  > tr").each(function(){					
			if($(this).hasClass('active-line-cb')){
				  $(this).addClass('deleted');						
				  $(this).hide();				
			}			
		});

		hideMenuPopup();
    });   

    //delete not selected    
     $(document).on('click','.cn-delete-all-not-selected', function(e){
		e.preventDefault();				
		$("#main-table  > tbody  > tr").each(function(){					
			if(!$(this).hasClass('active-line-cb')){
				  $(this).addClass('deleted');						
				  $(this).hide();				
			}			
		});

		hideMenuPopup();
    });  

	//Render data to popup html
	function displayDataInTable(asins){  
			if ( $.fn.DataTable.isDataTable('#main-table') ) {
			  $('#main-table').DataTable().destroy();
			}

			$('#main-table tbody').empty();
			appendLoader();	

			var sale_rank_total = 0;
			var total_sale_rank = 0;

	  		var num = 1;
			$.ajax({
		        type: "POST",	        
		        url: _apiUrl+"index.php?type=productInfo",
		        data: {asin: asins},  		        
		        success: function (responseJson) {	        		
		           		productInfos = $.parseJSON(responseJson);
		           		$("#main-table tbody").html('');
						$.each(productInfos.all_products, function(k, productInfo) {
					     if(productInfo.asin != ''){
					     	var rating = '<img src="../images/loader-upload_ajax.gif">';
					     	var review_count = '<img  src="../images/loader-upload_ajax.gif">';		
					     	var sale_rank = '<img  src="../images/loader-upload_ajax.gif">';	
					     	var fullSaleRankCol = '<img  src="../images/loader-upload_ajax.gif">';	

					     	category = $($('div[data-category] a span')[0]).text();
					     	if(productInfo.sale_rank != 'N/A'){
					     		sale_rank_total = sale_rank_total + parseInt(productInfo.sale_rank);						     		    	
					     		total_sale_rank = k + 1;
					     		var total = sale_rank_total / total_sale_rank;					     		
					     	}

							var tr = '';
							var tr = '<tr>';						
							tr += '<td class="srCol column-number"><b><span class="line-selection-number">'+num+'</span><input type="checkbox" value="'+num+'" class="line-selection"></b></td>';
							tr += '<td class="asinCol">'+productInfo.asin+'</td>';
							tr += '<td class="parentAsinCol">'+productInfo.parent_asin+'</td>';
							tr += '<td class="productNameCol">'+'<a target="_blank" href="'+productInfo.link+'" title="'+productInfo.title+'"> '+productInfo.title.substring(0,15)+'</a></td>';	
							tr += '<td class="imageCol"><img style="width: 50px;height:30px;" src="'+productInfo.product_image+'"></td>';
							tr += '<td class="brandCol">'+productInfo.brand+'</td>';
							tr += '<td class="priceCol">'+productInfo.formattedPrice+'</td>';													
							tr += '<td class="publisherCol"><a title="'+productInfo.publisher+'">'+productInfo.publisher.substring(0,10)+'</td>';						
							tr += '<td class="warrantyCol"><a title="'+productInfo.warranty+'">'+productInfo.warranty.substring(0,10)+'</td>';						
							tr += '<td class="estimatedCol">'+productInfo.sale+'</td>';						
							tr += '<td class="estimatedRevenueCol">'+productInfo.est_sale+'</td>';						
							tr += '<td class="saleRankCol">'+sale_rank+'</td>';	
							tr += '<td class="fbaCol">'+productInfo.fba_fees+'</td>';		
							tr += '<td class="ratingCol">'+rating+'</td>';		
							tr += '<td class="reviewCol">'+review_count+'</td>';		
							tr += '<td class="categoryCol"><a title="'+productInfo.category+'">'+productInfo.category+'</a></td>';						
							tr += '<td class="eanCol">'+productInfo.ean_number+'</td>';													
							tr += '<td class="upcCol">'+productInfo.upc_number+'</td>';	
							tr += '<td class="similarProductCol">'+'<a target="_blank" href="https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords='+productInfo.similar_product+'" title="'+productInfo.similar_product+'"> '+productInfo.similar_product+'</a></td>';								
							tr += '<td class="studioCol">'+productInfo.studio+'</td>';	
							tr += '<td class="manufacturerCol">'+productInfo.manufacturer+'</td>';
							tr += '<td class="numberSellerNewCol">'+productInfo.number_seller_new+'</td>';	
							tr += '<td class="numberSellerUsedCol">'+productInfo.number_seller_used+'</td>';	
							tr += '<td class="lowestPriceCol">'+productInfo.lowest_price+'</td>';	
							tr += '<td class="numberSellerRefurbishedCol">'+productInfo.number_seller_refurbished+'</td>';	
							var weight = productInfo.weight * 100;
							tr += '<td class="weightCol">'+ weight.toFixed(0); +'Hundredths Pounds </td>';	
							tr += '<td class="weightLbCol">'+productInfo.weight+'</td>';	
							tr += '<td class="bindingCol">'+productInfo.binding_category+'</td>';	
							tr += '<td class="priceHistoryCol"><a class="priceHistory" title="'+productInfo.asin+'">Click here to view</a></td>';						
							tr += '<td class="partNumberCol">'+productInfo.part_number+'</td>';	
							tr += '<td class="packageQuantityCol">'+productInfo.packageQuantity+'</td>';
							
							if(productInfo.package_dimensions.Height != undefined){	
							 tr += '<td class="packageDimensionsCol">Height:&nbsp;'+productInfo.package_dimensions.Height+'″&nbsp;Length:&nbsp;'+productInfo.package_dimensions.Height+'″<br>Width:&nbsp;'+productInfo.package_dimensions.Width+'″&nbsp;Weight:&nbsp;'+productInfo.package_dimensions.Weight+'&nbsp;Pounds</td>';	
							}else{
							 tr += '<td class="packageDimensionsCol"></td>';	
							}

							if(productInfo.editorial_review){
								tr += '<td class="editorialReviewCol"><a class="editorialReviewAnc">Click here to view<div style="display:none;">'+productInfo.editorial_review+'</div></a></td>';						
							}else{
								tr += '<td class="editorialReviewCol"></td>';		
							}

							tr += '<td class="mpnCol">'+productInfo.mpn_number+'</td>';

							tr += '<td class="fullSaleRankCol">'+fullSaleRankCol+'</td>';
							tr += '<td class="languageCol">'+productInfo.language+'</td>';
							tr += '<td class="releaseDateCol">'+productInfo.release_date+'</td>';
							tr += '<td class="publicationDateCol">'+productInfo.publication_date+'</td>';
							tr += '<td class="authorCol">'+productInfo.author+'</td>';
							tr += '<td class="numberOfPagesCol">'+productInfo.number_of_pages+'</td>';
							tr += '<td class="formatCol">'+productInfo.format+'</td>';
							tr += '<td class="productGroupCol">'+productInfo.product_group+'</td>';
							tr += '<td class="isAadultProductCol">'+productInfo.is_adult_product+'</td>';
							tr += '<td class="lowestUsedPriceCol">'+productInfo.lowest_used_price+'</td>';
							
							num++;						
							$("#main-table tbody").append(tr);	
							$('#total_records').html(num-1);
							hideDefaultColumn();							
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
		        },error: function (jqXHR, exception) {
			       var msg = handleError(jqXHR, exception);
			       httpError(msg);
			    },
		    });  	   
	  	}


	//get review and rating
	var getReviewAndRating = function(total_sale_rank){
	var sum_of_review = 0;
   	var review_count = 0;

   	var sum_of_rating = 0;
   	var rating_count = 0;
   	var rating_r = 0;	
   	var i = 1;
    $("#main-table tbody").find('tr').each(function(){
    	var url  = $(this).find('.productNameCol a').attr('href');
		category = $(this).find('.categoryCol a').attr('title');    		
    	var _that = $(this);  

		$.ajax({
		    url : url,
		    type : "get",		    
		    success : function(item) {
		    	var c = '';
		    	var v = '';
			    c = $(item).find('#averageCustomerReviews .a-icon-alt').text();
				v = $(item).find('#acrCustomerReviewText').first().text();			
				console.log('v ', v)				
				if(v){			
					rating_r = v.replace(/\D/g,'');
				}

				let rankTemp = $.trim($(item).find('#SalesRank').text());
				rankTemp = rankTemp.split('in');
				rankTemp = rankTemp[0].split(':');
				// deleting the # symbol
				rank = $.trim(rankTemp[1]).slice(1);
				console.log('rankTemp', rank);
				let th = $(item).find('th');
				let li = $(item).find('li');
				if(!rank){					
					for(j = 0; j < th.length; j++){
						if($.trim($(th[j]).text()) == 'Best Sellers Rank'){

							// full rank text
							let rankTemp = $.trim($(th[j]).next().text());
							// splitting the first number
							rankTemp = rankTemp.split('in');
							// deleting the # symbol
							rank = rankTemp[0].slice(1);
						}	
					};
				}

				_that.find('.saleRankCol').html(rank);	

				// console.log(category, rank);
				// var esting = getEstimatedSaless(category, rank.replace(/\D/g,''));
				// console.log('esting', esting);
				
				var review_count_c = '';
                if(c != 'Be the first to review this item'){
				if(c){			
					review_count_c = parseFloat(c.match(/-?(?:\d+(?:\.\d*)?|\.\d+)/)[0]);	
				}}else{
                    review_count_c = 'N/A';
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

				var fullSaleRank = ''; 
				var htmlSource = item;
				var productDetails = $(htmlSource).find("#productDetails_detailBullets_sections1").find("tr");
	      		productDetails.each(function(){
		            if($.trim($(this).find("th").text()) === "Best Sellers Rank"){
		            	fullSaleRank =  $.trim($($(this).find("td")).html());		            	
		            }
		        });	    			
				i++;

				var ces = '<a>Click<div style="display:none;">'+fullSaleRank+'</div></a>';
				_that.find('.fullSaleRankCol').html(ces);	
				_that.find('.ratingCol').text(review_count_c);								
				_that.find('.reviewCol').text(rating_r);					
		    },error: function (jqXHR, exception) {
		    	_that.find('.saleRankCol').html('');
			 	_that.find('.fullSaleRankCol').html('');	
				_that.find('.ratingCol').text('');								
				_that.find('.reviewCol').text('');	
		    },							
		 });
	   });		   
	}  	

	//Jquery sortorder lib
	var getSearchOption = function() { 		
		if (!$.fn.dataTable.isDataTable('#main-table')) {
			    table = $('#main-table').DataTable({
		        "paging":   false,
		        "ordering": true,
		        "info":     false
	   	   });
		}

		//hide search box
		$('#main-table_filter').hide();	
	} 

	//destroy sortorder from table
	var destroySortOrder = function(tablenameid){
		$("#"+tablenameid).trigger("destroy");
	}

	// show Full Rank 
	$(document).on('click', '.fullSaleRankCol', function(e){		
		var src = $(this).find('div').html();	
		if(!src){
			src = 'No Result Found !';
		}		
		$('.full-ranked').html(src);
		$('#full-rank-popup').modal('show');
	});

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

	// show editorial Review
	$(document).on('click', '.editorialReviewAnc', function(e){	
		var src = $(this).find('div').html();	
		$('.editorial-reviews').html(src);
		$('#editorial-review-popup').modal('show');
	});

	// show price history popup
	$(document).on('click', '.priceHistory', function(e){	
		var asin = $(this).attr('title');
		var src = '<iframe class="graph" frameborder="0" width="100%" height="310px" src="http://keepa.com/iframe_addon.html#1-0-'+asin+'"></iframe><br><br><a target="_blank" href="https://keepa.com/#!product/1-'+asin+'">Source: keepa.com</a>';
		$('#priceHistorySource').html(src);
		$('#price-history-popup').modal('show');	
	});

	//toggle filter search boxes
	$(document).on('click','#filters',function(){
		$('#main-table_filter').toggle();			
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

		if(!val){
			alert('add ASIN first');			
		}else{

    	appendLoader(); 
		val = val = val.replace(/(?:\r\n|\r|\n)/g, ',');
		var partsOfStr = val.split(',');

		var asins = [];				
		$.each(partsOfStr, function( index, value ) {
		  if(value && /^[a-z0-9\-]+$/i.test(value) && value.length >= 10){	
		  	asins.push(value);	
		  }
		});			

		if(asins.length == 0){
		  $('#import_list_asin').modal('hide');
		  return;
		}

		destroySortOrder('main-table');

		$('#import_list_asin').modal('hide');
		asins = $.unique(asins);		
       	displayDataInTable(asins);
       }
	});

	//Search Keyword amazon popup
	$(document).on('click','#act-search-amazon', function(){
		$('#search-keyword').modal('show');	
	});

	//onClick keyword search button
	$(document).on('click','#btn-search-amazon', function(){
		var search_val  = $('#ipt-search-amazon').val();
		
		if(search_val == ''){			
			$('#search-keyword-msg').show().text('Please enter Keyword');
			return;
		}

		var category_alias = $('#searchDropdownBox').find(":selected").val();
		var category_val = category_alias.split('=');		

		$('#search-keyword-msg').hide();

		var str = search_val;
		str = search_val.replace(/\s+/g, '+').toLowerCase();		

		var url  = "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3D"+category_val[1]+"&field-keywords="+str;	

		localStorage.setItem('currentURL',url);

		$('#search-keyword').modal('hide');	
		$('.tablesorter-filter-row').hide();			
		startScrap(url);		
	});

	//manage favorite
	$(document).on('click','.favorites-urls', function(){
		$('#favorites-urls-popup').modal('show');

		if(localStorage.getItem('url')){
			$(".favorites-list tbody").html('');	
			var data = localStorage.getItem('url');
			var substr = data.split(',');
			for(var i=0; i< substr.length; i++) {
			  rating_r = substr[i].replace(/[\[\]']+/g,'');
			  rating_r = rating_r.replace(/\"/g, "");			  
			  var tr = '';
			  var tr = '<tr>';
			  tr += '<td>'+rating_r.replace(".", "");'</td>';
			  tr += '<td><a href="#" class="remove_url">Remove</a>&nbsp;<a href="#" class="search_url">Search</a></td>';							
			  tr += '</tr>';			  
			  $(".favorites-list tbody").append(tr);	
			}
		}
	});


    //show setting popup
    $(document).on('click','#setting-popup-id', function(){
        $('#setting-popup').show();
    });

    //enable / disable setting
    $(document).on('click','.colToShow', function(){   
        var target_col =  $(this).data('col');
        if($(this).is(':checked')){                
        	localStorage.setItem(target_col, 'yes');        	        	
            $('.'+target_col).show();

        }else{
        	localStorage.setItem(target_col, 'no');         	
            $('.'+target_col).hide();
        }
    });

	//onClick add favorite button
	$(document).on('click','#btn-add-favorite', function(){
		var search_val  = $('.favorite-url-add-text').val();		
		

		if(search_val == ''){			
			$('#fav-keyword-msg').show().text('Please enter Keyword');
			return;
		}		

		var a = [];

		if(localStorage.getItem('url')){
			//console.log(localStorage.getItem('url'));
			//a.push(JSON.parse(localStorage.getItem('url')));
		} else{
			localStorage.setItem('url', JSON.stringify(a));
		}

		SaveDataToLocalStorage(search_val);		
	});

	function searchByURL(category, keyword){
		var str = '';
		str = keyword.replace(/\s+/g, '+').toLowerCase();		

		var url  = "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3D"+category+"&field-keywords="+str;
		
		localStorage.setItem('currentURL',url);

		startScrap(url);	
	}

	function SaveDataToLocalStorage(data){
	    var a = [];
	    // Parse the serialized data back into an aray of objects
	    a = JSON.parse(localStorage.getItem('url'));
	    // Push the new data (whether it be an object or anything else) onto the array
	    a.push(data);
	    // Alert the array value
	    //alert(a);  // Should be something like [Object array]	    
	    // Re-serialize the array back into a string and store it in localStorage
	    localStorage.setItem('url', JSON.stringify(a));
	    //console.log(localStorage.getItem('url'))

	  //   if(localStorage.getItem('url')){
			// $(".favorites-list tbody").html('');	
			// var data = localStorage.getItem('url');
			// var substr = data.split(',');
			// for(var i=0; i< substr.length; i++) {
			//   rating_r = substr[i].replace(/[\[\]']+/g,'');
			//   rating_r = rating_r.replace(/\"/g, "");			  
			//   rating_r = rating_r.replace(".", "");			  
			  var tr = '';
			  var tr = '<tr>';
			  tr += '<td>'+data+'</td>';
			  tr += '<td><span href="#" class="remove_url">Remove</span>&nbsp;<span href="#" class="search_url">Search</span></td>';							
			  tr += '</tr>';			  
			  $(".favorites-list tbody").append(tr);	
			//}
		//}
	}

	//search favorite keyword
	$(document).on('click','.search_url', function(){
		 var pn = $(this).closest('td').prev('td').text();
		 $('#favorites-urls-popup').modal('hide');
		 $('.tablesorter-filter-row').hide();
		 searchByURL('aps', pn);
	});

	//remove favorite keyword
	$(document).on('click','.remove_url', function(){
	     var pn = $(this).closest('td').prev('td').text();		
		 var data = localStorage.getItem('url');
		// localStorage.removeItem('url');	
		 var a = [];

			var substr = data.split(',');
			for(var i=0; i< substr.length; i++) {
			  rating_r = substr[i].replace(/[\[\]']+/g,'');
			  rating_r = rating_r.replace(/\"/g, "");			  
			  rating_r = rating_r.replace(".", "");			  
			  if(pn == rating_r){
				substr.splice(i,1);	
				localStorage.removeItem('url');
				localStorage.setItem('url',substr);	
				$(this).closest('tr').remove();							
				break;		
		      }
		}
	});

	//handle ajax http error
	function handleError(jqXHR, exception){
		  	var msg = 'There seems to be some error, Please try again !';
	        if (jqXHR.status === 0) {
	            msg = 'Not connect.\n Verify Network.';
	        } else if (jqXHR.status == 404) {
	            msg = 'Requested page not found. [404]';
	        } else if (jqXHR.status == 500) {
	            msg = 'Internal Server Error [500].';
	        } else if (exception === 'parsererror') {
	            msg = 'Requested JSON parse failed.';
	        } else if (exception === 'timeout') {
	            msg = 'Time out error.';
	        } else if (exception === 'abort') {
	            msg = 'Ajax request aborted.';
	        } else {
	            msg = 'Uncaught Error.\n' + jqXHR.responseText;
	        }

	        return msg;
	}	

	/*for fba fees
	$.ajax({
	          url: "http://asinspector.com/rest/getMeFBA.php",   
	          method:'post',  
	          data: {
	              getFBAFeesForListAsins: 0,
	                'data[0][asin]': 'B073TSKFRX',                  
	                'data[0][weight]': '80',                  
	                'data[0][width]': '670',                  
	                'data[0][length]': '1150',                  
	                'data[0][height]': '80'                  
	            },
	            success: function( data ) {              
	               var sum = data.dataFba[0].fbaStorageFee + data.dataFba[0].fees + data.dataFba[0].orderHandling + data.dataFba[0].pickAndPack + data.dataFba[0].weightHandling;
	               console.log('sum', sum.toFixed(2))
	            }
	        });
	*/
});

