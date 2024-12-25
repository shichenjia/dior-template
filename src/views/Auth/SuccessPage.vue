<template>
  <div class="successPage">
    <van-empty class="messageWrapper" :description="$route.query.message">
      <van-button round type="danger" block class="bottom-button" @click="jumpTo">查看</van-button>
    </van-empty>
  </div>
</template>

<script>
export default {
    "name": "SuccessPage",
    "methods": {
        jumpTo() {
            const params = { "menuId": "myCase" };

            if (this.$route.query.isThird) {
                params["isThird"] = this.$route.query.isThird;
            }
            this.$router.push({ "path": "/myCase", "query": params });
        }
    }
};
</script>

<style lang="scss" scoped>
.successPage {
  height: 100%;
  background-color: $white;
  .messageWrapper {
    height: 100%;
    ::v-deep .van-empty__image {
      font-size: 60px;
      vertical-align: middle;
    }
    ::v-deep .van-empty__description {
      font-size: $font-size-92;
    }
  }
  .bottom-button {
    position: absolute;
    bottom: 500px;
    width: 95%;
    height: 260px;
    font-size: $font-size-82;
    background-color: $primary;
    border-color: $primary;
    transform: translate(-50%, -50%);
  }
}
</style>