export type AnimeTitleOriginalJson = {
    animetitles: {
        anime: {
            $: {
                aid: string
            },
            title: {
                _: string,
                $: {
                    type: string
                    "xml:lang": string
                }
            }[]
        }[]
    }
}