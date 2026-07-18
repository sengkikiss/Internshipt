var data = [
  { id: 1, name: 'John Doe', sex: 'Male', dob: '1995-04-12', email: 'john@example.com', phone: '012345678' },
  { id: 2, name: 'Jane Smith', sex: 'Female', dob: '1998-09-03', email: 'jane@example.com', phone: '098765432' }
];
var nextId = 3;
var editMode = false;

$(function () {
  var $table = $('#table');
  $table.bootstrapTable('load', data);

  var modal = new bootstrap.Modal(document.getElementById('userModal'));

  function getSelected() {
    return $table.bootstrapTable('getSelections');
  }

  // Enable/disable Edit & Remove based on selection
  $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
    var selected = getSelected();
    $('#btnEdit').prop('disabled', selected.length !== 1);
    $('#btnRemove').prop('disabled', selected.length === 0);
  });

  // Open modal for ADD
  $('#btnAdd').on('click', function () {
    editMode = false;
    $('#modalTitle').text('Add New');
    $('#btnSave').html('<i class="bi bi-check-lg"></i> Create');
    $('#userForm')[0].reset();
    $('#userId').val('');
    $('#email').removeClass('is-invalid');
    modal.show();
  });

  // Open modal for EDIT (uses the single selected row)
  $('#btnEdit').on('click', function () {
    var selected = getSelected();
    if (selected.length !== 1) return;
    var row = selected[0];

    editMode = true;
    $('#modalTitle').text('Edit User');
    $('#btnSave').html('<i class="bi bi-check-lg"></i> Save');
    $('#userId').val(row.id);
    $('#name').val(row.name);
    $('#sex').val(row.sex || '');
    $('#dob').val(row.dob || '');
    $('#email').val(row.email);
    $('#phone').val(row.phone);
    $('#email').removeClass('is-invalid');
    modal.show();
  });

  // Remove selected rows
  $('#btnRemove').on('click', function () {
    var selected = getSelected();
    if (selected.length === 0) return;
    if (!confirm('Remove ' + selected.length + ' selected record(s)?')) return;

    var idsToRemove = selected.map(function (r) { return r.id; });
    var current = $table.bootstrapTable('getData');
    current = current.filter(function (item) { return idsToRemove.indexOf(item.id) === -1; });
    $table.bootstrapTable('load', current);
    $('#btnEdit').prop('disabled', true);
    $('#btnRemove').prop('disabled', true);
  });

  // Save (Add or Edit) with duplicate email check
  $('#btnSave').on('click', function () {
    var form = document.getElementById('userForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var id = $('#userId').val();
    var name = $('#name').val().trim();
    var sex = $('#sex').val();
    var dob = $('#dob').val();
    var email = $('#email').val().trim().toLowerCase();
    var phone = $('#phone').val().trim();

    var current = $table.bootstrapTable('getData');

    // Duplicate check: same email but different id
    var isDuplicate = current.some(function (item) {
      return item.email.toLowerCase() === email &&
             (!editMode || String(item.id) !== String(id));
    });

    if (isDuplicate) {
      $('#email').addClass('is-invalid');
      return;
    }
    $('#email').removeClass('is-invalid');

    if (editMode) {
      current = current.map(function (item) {
        if (String(item.id) === String(id)) {
          return { id: item.id, name: name, sex: sex, dob: dob, email: email, phone: phone };
        }
        return item;
      });
    } else {
      current.push({ id: nextId++, name: name, sex: sex, dob: dob, email: email, phone: phone });
    }

    $table.bootstrapTable('load', current);
    modal.hide();
  });
});