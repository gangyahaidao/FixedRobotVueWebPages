<template>
  <el-table :data="dataList" style="width: 100%;padding-top: 15px;">
    <el-table-column :label=colum1 min-width="150">
      <template slot-scope="scope">
        {{ scope.row.name | orderNoFilter }}
      </template>
    </el-table-column>
    <el-table-column :label=colum2 width="250" align="center">
      <template slot-scope="scope">
        {{ scope.row.score }}
      </template>
    </el-table-column>
    <el-table-column :label=colum3 width="100" align="center">
      <template slot-scope="scope">
        <el-tag :type="scope.row.rank | rankFilter"> {{ scope.row.rank }}</el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>

export default {
  props: {
    colum1: {
      type: String,
      default: 'colum1'
    },
    colum2: {
      type: String,
      default: 'colum2'
    },
    colum3: {
      type: String,
      default: 'colum3'
    },
    dataList: {
      type: Array,
      default: []
    }
  },
  filters: {
    rankFilter(rank) {
      if (rank <= 3) {
        return 'danger'
      } else {
        return 'success'
      }
    },
    orderNoFilter(str) {
      return str.substring(0, 30)
    }
  },
  data() {
    return {

    }
  },
  created() {

  },
  methods: {
    // fetchData() {
    //   fetchList().then(response => {
    //     this.list = response.data.items.slice(0, 8)
    //   })
    // }
  }
}
</script>
