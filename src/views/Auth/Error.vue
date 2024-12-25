<template>
  <van-empty class="errorPage" image="error" :description="message" />
</template>
<script>
export default {
    "name": "error",
    data() {
        return {
            "message":"错误"
        };
    },
    mounted() {
        let that =this;

        this.$nextTick(() => {
            console.log(that.$route);
            if(this.$isNullOrUndefined(that.$route.query.message)){
                that.message=that.$decrypt(that.$route.query.message);
            }
        });
    }
};
</script>
<style lang="scss" scoped>
.errorPage {
    height: 100vh;
    background-color: $white;
    ::v-deep .van-empty__description {
        @include fontStyle(NotoSansCJK-Regular, $font-size-82, #969799);
    }
}
</style>