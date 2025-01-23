let arr_data = [];

function fn_init_search_comp(type) {
    const fragment = document.createDocumentFragment();    
    const defaultItem = document.createElement('input');
    defaultItem.type = 'checkbox';
    defaultItem.value = '';
    defaultItem.name = type+'_all';
    let labelItem = document.createElement('label');
    labelItem.textContent = '전체';
    labelItem.htmlFor = type+'_all';
    labelItem.classList.add('selected');
    labelItem.classList.add('selectable-items');
    labelItem.addEventListener('click', () => fn_setData(type, true));
    fragment.appendChild(defaultItem);
    fragment.appendChild(labelItem);

    let commonData = null;
    if(type == 'year') {
        const current_year = new Date().getFullYear();
        let idx = 0;
        let year = current_year;
        while(year > 1982) {
            year = current_year - idx;
            const labelFor = type + '_' + year;
            const optionItem = document.createElement('input');
            optionItem.type = 'checkbox';
            optionItem.id = labelFor;
            optionItem.name = labelFor;
            optionItem.value = year;
            optionItem.textContent = year;
            fragment.appendChild(optionItem);

            labelItem = document.createElement('label');
            labelItem.textContent = year;
            labelItem.htmlFor = labelFor;
            labelItem.classList.add('selectable-items');
            labelItem.addEventListener('click', () => fn_setData(labelFor));
            fragment.appendChild(labelItem);

            idx++;
        }
    } else {
        commonData = window.commonData[type];
        const commonData_key = Object.keys(commonData);
        commonData_key.forEach(key => {
            const labelFor = type + '_' + key;
            const optionItem = document.createElement('input');
            optionItem.type = 'checkbox';
            optionItem.name = labelFor;
            optionItem.id = labelFor;
            optionItem.value = key;
            optionItem.textContent = commonData[key];
            fragment.appendChild(optionItem);

            labelItem = document.createElement('label');
            labelItem.textContent = commonData[key];
            labelItem.htmlFor = labelFor;
            labelItem.classList.add('selectable-items');
            labelItem.addEventListener('click', () => fn_setData(labelFor));
            fragment.appendChild(labelItem);
        })
    }
    const target_comp = document.getElementById('list_'+type);
    target_comp.appendChild(fragment);
    return commonData;
}

async function fn_init_list_data() {
    try {
        arr_data = await window.commonApi.search();
        const arr_stat = window.commonData.stats();
        const list_table = document.getElementById('list');
        const stat_list = list_table.querySelector('thead');
        const data_list = list_table.querySelector('tbody');
       
        const sortable = ['year', 'pow', 'dex', 'con', 'int', 'spd', 'def', 'angle'];
        // th 생성 및 클릭 시 정렬이벤트 설정
        Object.keys(arr_stat).forEach((stat) => {
            const thItem = document.createElement('th');
            thItem.title = stat;
            thItem.textContent = arr_stat[stat];
            if(sortable.includes(stat)) {
                thItem.classList.add('sortable');
                thItem.onclick = () => {
                    const thClass = thItem.classList;
                        let mode = '';
                        if(thClass.contains('asc')) {
                            thClass.remove('desc');
                            thClass.remove('asc');
                        } else if(thClass.contains('desc')) {
                            mode = 'asc';
                            thClass.remove('desc');
                            thClass.add('asc');
                        } else {
                            document.querySelectorAll('.sortable').forEach((item) => {
                                item.classList.remove('desc');
                                item.classList.remove('asc');
                            })
                            mode = 'desc';
                            thClass.add('desc');
                        }

                    arr_data = arr_data.sort((a, b) => {
                        if(mode == 'asc') {
                            return a[stat] - b[stat];
                        } else if(mode == 'desc') {
                            return b[stat] - a[stat];
                        } else {
                            return a.idx - b.idx;
                        }
                    })

                    data_list.innerHTML = '';
                    fn_set_data_list(data_list, arr_stat, arr_data);
                }
            }
            stat_list.appendChild(thItem);

        })
        // const thItem = document.createElement('th');
        // thItem.textContent = '상세';
        // stat_list.appendChild(thItem);

        fn_set_data_list(data_list, arr_stat, arr_data);
    } catch(err) {
        console.log(err);
    }
}

function fn_set_data_list(data_list, arr_stat, arr_data) {
    const fragment = document.createDocumentFragment();
    // td 리스트 생성
    const types = window.commonData.type;
    const positions = window.commonData.position;
    arr_data.forEach((data, index) => {
        const trItem = document.createElement('tr');
        trItem.name = data.idx;
        trItem.onclick = () => fn_selectRow(trItem, data);
        trItem.oncontextmenu = (event) => {
            event.preventDefault();
            const customMenu = document.querySelector('.detail-context-menu');
            customMenu.style.display = 'block';
            customMenu.style.left = `${event.pageX}px`;
            customMenu.style.top = `${event.pageY}px`;
            document.querySelectorAll('.context-row').forEach((row) => {
                row.classList.remove('context-row');
            })
            trItem.classList.add('context-row');
        }
        
        const selectedPlayer = window.commonData.getSelectedPlayer();
        if(selectedPlayer.findIndex(e => e.idx === data.idx) > -1) {
            trItem.classList.add('selected');
        }
        Object.keys(arr_stat).forEach((stat) => {
            const tdItem = document.createElement('td');
            if(stat == 'type') {
                tdItem.textContent = types[data[(stat)]];
            } else if(stat == 'position') {
                tdItem.textContent = positions[data[stat]];
            } else {
                tdItem.textContent = window.commonFunc.null2Str(data[stat], '-');
            }
            if(data.use_yn == 'N') {
                trItem.style.color = 'gray';
            }
            
            trItem.appendChild(tdItem);
        })
        // const tdItem = document.createElement('td');
        // const detailBtn = document.createElement('button');
        // detailBtn.innerText = '상세';
        // detailBtn.disabled = (data.use_yn === 'N');
        // tdItem.appendChild(detailBtn);
        // trItem.appendChild(tdItem);

        fragment.appendChild(trItem);
    })
    data_list.appendChild(fragment);
}

function fn_init_modal() {
    document.body.style.width = window.innerWidth + 'px';
    document.body.style.height = window.innerHeight + 'px';
    document.querySelector('.modal').style.width = window.innerWidth + 'px'; 
    document.querySelector('.modal').style.height = window.innerHeight + 'px';
    document.querySelector('.title-div').style.width = window.innerWidth + 'px'; 
    document.querySelectorAll('.close-btn').forEach(button => {
        button.addEventListener('click', () => {
            window.commonApi.closeModal();
        })
    });
}