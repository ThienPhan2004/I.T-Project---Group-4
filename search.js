// search.js

function searchContent() {
  var input,
    filter,
    contentElements,
    i,
    elementText,
    txtValue,
    found = false;
  input = document.getElementById("searchInput");
  filter = input.value.toLowerCase();
  contentElements = document.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6, .image-box p"
  );

  // Xóa highlight cũ trước khi tìm kiếm mới
  resetHighlight(contentElements);

  for (i = 0; i < contentElements.length; i++) {
    elementText = contentElements[i];
    txtValue = elementText.textContent || elementText.innerText;

    // Tìm kiếm nếu đoạn văn, tiêu đề hoặc mô tả hình ảnh khớp với từ khóa
    if (txtValue.toLowerCase().includes(filter)) {
      // Cuộn đến phần tử đầu tiên khớp tìm kiếm
      elementText.scrollIntoView({ behavior: "smooth", block: "center" });

      // Highlight phần tử khớp kết quả
      elementText.style.backgroundColor = "yellow";
      found = true;
      break; // Tìm thấy kết quả đầu tiên thì dừng lại
    }
  }

  // Nếu không tìm thấy kết quả
  if (!found) {
    alert("Không tìm thấy kết quả phù hợp.");
  }
}

// Hàm xóa highlight cũ
function resetHighlight(contentElements) {
  for (var i = 0; i < contentElements.length; i++) {
    contentElements[i].style.backgroundColor = "";
  }
}
