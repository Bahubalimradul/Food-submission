function showPicture() {
  const selectedFile = foodpicture.files[0];
  fp.width = 50;
  fp.src = URL.createObjectURL(selectedFile);
}

$(document).ready(function(){ 
    $.get('/food/fillcategory',function(response){
        response.data.map((item)=>{
            $('#categoryid').append($('<option>').text(item.categoryname).val(item.categoryid))
        })
    })
    $('#categoryid').change(function() {
        $.get('/food/fillsubcategory', { categoryid: $('#categoryid').val() }, function(response) {
            $('#subcategoryid').empty();
            $('#subcategoryid').append($('<option>').text('Select Subcategory'));
            response.data.map((item) => {
                $('#subcategoryid').append($('<option>').text(item.subcategoryname).val(item.subcategoryid));
            });
        });
    });
}) 