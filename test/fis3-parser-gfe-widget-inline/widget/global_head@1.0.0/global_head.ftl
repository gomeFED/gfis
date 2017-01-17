<#macro global_head title keyword description applicable canonical alternate dns>
    <meta charset="UTF-8">
    <meta name="renderer" content="webkit">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta http-equiv="Cache-Control" content="no-siteapp"> 
    <meta http-equiv="Cache-Control" content="no-transform">
    <#if applicable!="">
    <meta name="applicable-device" content="${applicable!}">
    </#if>
    <meta name="keywords" content="${keyword!}">
    <meta name="description" content="${description!}">
    <title>${title!}</title>
    <#if dns?? && (dns?size>0)>
    <#list dns as value>
    <link rel="dns-prefetch" href="//${value!}.gomein.net.cn">
    </#list>
    </#if>
    <#if canonical!="">
    <link rel="canonical" href="${canonical!}">
    </#if>
    <#if alternate!="">
    <link rel="alternate" media="only screen and(max-width: 640px)" href="${alternate!}">
    <meta http-equiv="mobile-agent" content="format=html5; url=${alternate!}">
    </#if>
    <link rel="shortcut icon" href="//app.gomein.net.cn/favicon.ico" type="image/x-icon">
</#macro>