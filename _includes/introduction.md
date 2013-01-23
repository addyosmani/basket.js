### Introduction

basket.js is a small JavaScript library supporting localStorage caching of scripts. If script(s) have previously been saved locally, they will simply be loaded and injected into the current document. If not, they will be XHR'd in for use right away, but cached so that no additional loads are required in the future.
