<template>
  <div class="collect-page">
    <el-form :inline="true" ref="form">
      <el-form-item>
        <el-button class="addrow_btn" @click="addRow">Add New Text Row</el-button>
        <el-button class="addcol_btn" @click="addColumn">Add New Language Column</el-button>
      </el-form-item>
      <el-form-item>
        <el-button class="delrow_btn" @click="delRow">Delete Text Row</el-button>
        <el-button class="delcol_btn" @click="delCol">Delete Most Recent Column</el-button>
      </el-form-item>
    </el-form>
    <div class="table-container">
      <table class="main-table" cellspacing="0">
        <tr>
          <td>
            <textarea style="width: 100%; height: 100%; border: none">Country 1</textarea>
          </td>
          <td>
            <textarea style="width: 100%; height: 100%; border: none">Country 2</textarea>
          </td>
        </tr>
      </table>
    </div>
    <el-form>
      <el-form-item>
        <el-button class="save_btn" :loading="save_clicked" @click="save">Save</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import axios from 'axios'
import * as r_const from '@/router/consts'

export default {
  name: 'TranslatorPage',
  data() {
    return {
      rows: 1,
      cols: 2,
      save_clicked: false,
    }
  },
  methods: {
    async save() {
      this.save_clicked = true
      var table = document.getElementsByClassName('main-table')[0]
      var header = []
      var rows = []

      for (let i = 0; i < table.rows[0].cells.length; i++) {
        header.push(
          table.rows[0].cells[i].getElementsByTagName('textarea')[0].value
        )
      }
      for (let i = 1; i < table.rows.length; i++) {
        var row = {}
        for (var j = 0; j < table.rows[i].cells.length; j++) {
          row[header[j]] =
            table.rows[i].cells[j].getElementsByTagName('textarea')[0].value
        }
        rows.push(row)
      }
      const data = JSON.stringify(rows)
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([data], { type: 'text/plain' }))
      a.setAttribute('download', 'data.json')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      try {
        const delay = (ms) => new Promise((res) => setTimeout(res, ms))
        await axios.get(r_const.queryCollectData, { params: { json: data } })
        await delay(2000)
        this.save_clicked = false
      } catch (err) {
        console.error(err)
      }
    },
    delCol() {
      let tbl = document.getElementsByClassName('main-table')[0]
      let tr = tbl.getElementsByTagName('tr')
      for (let i = 0; i < tr.length; i++) {
        tr[i].deleteCell(-1)
      }
      this.cols--
    },
    delRow() {
      let table = document.querySelector('.main-table')
      table.deleteRow(-1)
      this.rows--
    },
    addColumn() {
      //creates a new row element
      let tbl = document.getElementsByClassName('main-table')[0]
      let tr = tbl.getElementsByTagName('tr')
      for (let i = 0; i < tr.length; i++) {
        let td = document.createElement('td')
        td.style.borderWidth = '1px'
        td.style.borderStyle = 'solid'
        td.style.borderColor = 'black'
        td.style.padding = '7px'
        let input = document.createElement('textarea')
        if (i == 0) {
          input.textContent = 'Language ' + (this.cols + 1)
        }
        input.style.width = '100%'
        input.style.height = '100%'
        input.style.border = 'none'
        td.appendChild(input)
        tr[i].appendChild(td)
      }
      this.cols++
    },
    addRow() {
      //creates a new row element
      let row = document.createElement('tr')

      for (let i = 0; i < this.cols; i++) {
        let column = document.createElement('td')
        column.style.borderWidth = '1px'
        column.style.borderStyle = 'solid'
        column.style.borderColor = 'black'
        column.style.padding = '7px'
        let columntext = document.createElement('textarea')
        columntext.style.width = '100%'
        columntext.style.height = '100%'
        columntext.style.border = 'none'
        column.appendChild(columntext)
        row.appendChild(column)
      }

      //appends the row to the table
      document.querySelector('.main-table').appendChild(row)
      this.rows++
    },
  }, // end methods
} // end default
</script>

<style scoped>
.collect-page {
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
  height: 74vh;
  width: 80vw;
  overflow-x: hidden;
  overflow-y: auto;
  border: 2px solid #d4d3d3e6;
  border-radius: 5px;
}

.table-container {
  padding: 5px;
  margin: 0 auto;
}

.main-table {
  width: 100%;
  color: white;
}

th {
  padding: 7px;
  border: 1px solid black;
  border-collapse: collapse;
}

td {
  text-align: center;
  padding: 7px;
  border: 1px solid black;
  border-collapse: collapse;
}

button {
  float: right;
  border: none;
  padding: 5px 12px;
  margin: 10px 0;
  background: #27afd8;
  color: white;
  cursor: pointer;
}
</style>
