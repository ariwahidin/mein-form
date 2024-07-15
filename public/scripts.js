$(document).ready(function () {
    document.getElementById('inbound-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const inboundNumber = document.getElementById('inboundNumber').value;
        const serialNumber = document.getElementById('serialNumber').value;

        fetch('/api/inbound', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inboundNumber, serialNumber })
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.success == true) {
                    getInbound(inboundNumber);
                    document.getElementById('serialNumber').value = '';
                    document.getElementById('serialNumber').focus();
                } else {
                    alert('Gagal insert data');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });

    $('#tbodyResult').on('click', '.btnDelete', function (e) {
        let id = $(this).data('id');
        console.log(id)
        deleteSerial(id);
    })

    $('#btnLihat').on('click', function(){
        let inboundNumber = $('#inboundNumber').val();
        if(inboundNumber.trim() != ""){
            getInbound(inboundNumber);
        }
    });

    function getInbound(inboundNumber) {
        fetch('/api/inbound/get', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inboundNumber })
        })
            .then(response => response.json())
            .then(data => {
                let divResult = document.getElementById('tbodyResult');
                divResult.innerHTML = "";
                let rows = data.data;
                let no = 1;
                let tr = ``;
                rows.forEach(item => {
                    console.log(item)
                    tr += `<tr>
                                <td>${no++}</td>
                                <td>${item.inbound_number}</td>
                                <td>${item.serial_number}</td>
                                <td><button class="btnDelete" data-id="${item.id}">hapus</button></td>
                                </tr>`;
                });
                divResult.innerHTML = tr;
                $('#totData').text(rows.length);
                console.log(rows);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    function deleteSerial(id) {
        fetch('/api/inbound/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success == true) {
                    getInbound($('#inboundNumber').val())
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    $('#downloadBtn').click(function () {
        const inboundNumber = $('#inboundNumber').val();
        if (inboundNumber) {
            window.location.href = `/api/download/${inboundNumber}`;
        } else {
            alert('Please enter an inbound number first.');
        }
    });
})
