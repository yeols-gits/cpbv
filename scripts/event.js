const setSearchData = (key, data) => { window.commonData.setSearchData(key, data); }
const getSearchData = (key) => { return window.commonData.getSearchData(key); }
const setPlayer = (data) => { window.commonData.setPlayer(data); }
const getSelectedPlayer = () => { return window.commonData.getSelectedPlayer(); }

function fn_save() {
    const dataForm = document.getElementById('statForm');

    let chkResult = true;
    const result = {};
    const inputItems = dataForm.querySelectorAll('input');
    for(let i = 0; i < inputItems.length; i++) {
        const inputValue = inputItems[i].value;
        const inputId = inputItems[i].id;
        result[inputId] = inputValue;
    }
    const selectItems = dataForm.querySelectorAll('select');
    for(let i = 0; i < selectItems.length; i++) {
        const selectValue = selectItems[i].value;
        const selectName = selectItems[i].name;

        result[selectName] = selectValue;
    }
    window.commonApi.addData((result));
}

function onchange_radio(radio) {
    const type = radio.value;
    document.querySelectorAll('label[name="typeLabel"]').forEach((label) => {
        label.classList.remove('selected');
    })

    const childrens = document.getElementById('list_positions').children;
    for(let i = 0; i < childrens.length; i++) {
        const childName = childrens[i].name;
        const childValue = childrens[i].value;
        if(childrens[i].tagName == 'INPUT') {
            if(childValue != '') {
                document.querySelector(`label[for=${childName}]`).classList.remove('selected');
                if(childName.includes('SP') || childName.includes('RP') || childName.includes('CP')) {
                    document.querySelector(`label[for=${childName}]`).style.display = (type == 'P') ? '' : 'none';
                } else {
                    document.querySelector(`label[for=${childName}]`).style.display = (type == 'P') ? 'none' : '';
                }
            } else {
                document.querySelector(`label[for=${childName}]`).classList.add('selected');
            }
        }
    }

    document.querySelector(`label[for=${radio.id}]`).classList.add('selected');
    setSearchData('position');
    setSearchData('type', type);
}

function fn_setData(id, isAll) {
    if(isAll) {
        const childrens = document.getElementById('list_'+id).children;
        for(let i = 0; i < childrens.length; i++) {
            const childValue = childrens[i].value;
            if(childValue != '' && childrens[i].tagName == 'INPUT') {
                document.querySelector(`label[for=${childrens[i].id}]`).classList.remove('selected');
            }
        }
        document.querySelector(`label[for=${id}_all]`).classList.add('selected');
        
        setSearchData(id);
    } else {
        const type_detail = id.split('_')[0];
        document.querySelector(`label[for=${type_detail}_all]`).classList.remove('selected');
        document.querySelector(`label[for=${id}]`).classList.toggle('selected');
        const aa = getSearchData(type_detail) || [];
        const selectedValue = document.getElementById(`${id}`).value;
        const index = aa.indexOf(selectedValue);
        if(index > -1) {
            aa.splice(index, 1);                    
        } else {
            aa.push(selectedValue);
        }
        setSearchData(type_detail, aa);
    }
}

async function fn_selectRow(trItem, data) {
    trItem.classList.toggle('selected');
    await setPlayer(data);

    const cnt = getSelectedPlayer().length;
    if(cnt > 0) {
        document.querySelector('.select-list-btn').innerHTML = '선택확인 (' + cnt +')';
    } else {
        document.querySelector('.select-list-btn').innerHTML = '선택확인';
    }
}

function fn_search() {
    console.log(getSearchData());
    console.log(getSelectedPlayer());
}