import {
  DevconConfig,
  DevconCardConfig,
  DevconViewConfig,
} from "../../../data/devcon";

export const addCard = (
  config: DevconConfig,
  path: [number],
  cardConfig: DevconCardConfig
): DevconConfig => {
  const [viewIndex] = path;
  const views: DevconViewConfig[] = [];

  config.views.forEach((viewConf, index) => {
    if (index !== viewIndex) {
      views.push(config.views[index]);
      return;
    }

    const cards = viewConf.cards
      ? [...viewConf.cards, cardConfig]
      : [cardConfig];

    views.push({
      ...viewConf,
      cards,
    });
  });

  return {
    ...config,
    views,
  };
};

export const addCards = (
  config: DevconConfig,
  path: [number],
  cardConfigs: DevconCardConfig[]
): DevconConfig => {
  const [viewIndex] = path;
  const views: DevconViewConfig[] = [];

  config.views.forEach((viewConf, index) => {
    if (index !== viewIndex) {
      views.push(config.views[index]);
      return;
    }

    const cards = viewConf.cards
      ? [...viewConf.cards, ...cardConfigs]
      : [...cardConfigs];

    views.push({
      ...viewConf,
      cards,
    });
  });

  return {
    ...config,
    views,
  };
};

export const replaceCard = (
  config: DevconConfig,
  path: [number, number],
  cardConfig: DevconCardConfig
): DevconConfig => {
  const [viewIndex, cardIndex] = path;
  const views: DevconViewConfig[] = [];

  config.views.forEach((viewConf, index) => {
    if (index !== viewIndex) {
      views.push(config.views[index]);
      return;
    }

    views.push({
      ...viewConf,
      cards: (viewConf.cards || []).map((origConf, ind) =>
        ind === cardIndex ? cardConfig : origConf
      ),
    });
  });

  return {
    ...config,
    views,
  };
};

export const deleteCard = (
  config: DevconConfig,
  path: [number, number]
): DevconConfig => {
  const [viewIndex, cardIndex] = path;
  const views: DevconViewConfig[] = [];

  config.views.forEach((viewConf, index) => {
    if (index !== viewIndex) {
      views.push(config.views[index]);
      return;
    }

    views.push({
      ...viewConf,
      cards: (viewConf.cards || []).filter(
        (_origConf, ind) => ind !== cardIndex
      ),
    });
  });

  return {
    ...config,
    views,
  };
};

export const swapCard = (
  config: DevconConfig,
  path1: [number, number],
  path2: [number, number]
): DevconConfig => {
  const card1 = config.views[path1[0]].cards![path1[1]];
  const card2 = config.views[path2[0]].cards![path2[1]];

  const origView1 = config.views[path1[0]];
  const newView1 = {
    ...origView1,
    cards: origView1.cards!.map((origCard, index) =>
      index === path1[1] ? card2 : origCard
    ),
  };

  const origView2 = path1[0] === path2[0] ? newView1 : config.views[path2[0]];
  const newView2 = {
    ...origView2,
    cards: origView2.cards!.map((origCard, index) =>
      index === path2[1] ? card1 : origCard
    ),
  };

  return {
    ...config,
    views: config.views.map((origView, index) =>
      index === path2[0] ? newView2 : index === path1[0] ? newView1 : origView
    ),
  };
};

export const moveCard = (
  config: DevconConfig,
  fromPath: [number, number],
  toPath: [number]
): DevconConfig => {
  if (fromPath[0] === toPath[0]) {
    throw new Error("You can not move a card to the view it is in.");
  }
  const fromView = config.views[fromPath[0]];
  const card = fromView.cards![fromPath[1]];

  const newView1 = {
    ...fromView,
    cards: (fromView.cards || []).filter(
      (_origConf, ind) => ind !== fromPath[1]
    ),
  };

  const toView = config.views[toPath[0]];
  const cards = toView.cards ? [...toView.cards, card] : [card];

  const newView2 = {
    ...toView,
    cards,
  };

  return {
    ...config,
    views: config.views.map((origView, index) =>
      index === toPath[0]
        ? newView2
        : index === fromPath[0]
        ? newView1
        : origView
    ),
  };
};

export const addView = (
  config: DevconConfig,
  viewConfig: DevconViewConfig
): DevconConfig => ({
  ...config,
  views: config.views.concat(viewConfig),
});

export const replaceView = (
  config: DevconConfig,
  viewIndex: number,
  viewConfig: DevconViewConfig
): DevconConfig => ({
  ...config,
  views: config.views.map((origView, index) =>
    index === viewIndex ? viewConfig : origView
  ),
});

export const swapView = (
  config: DevconConfig,
  path1: number,
  path2: number
): DevconConfig => {
  const view1 = config.views[path1];
  const view2 = config.views[path2];

  return {
    ...config,
    views: config.views.map((origView, index) =>
      index === path2 ? view1 : index === path1 ? view2 : origView
    ),
  };
};

export const deleteView = (
  config: DevconConfig,
  viewIndex: number
): DevconConfig => ({
  ...config,
  views: config.views.filter((_origView, index) => index !== viewIndex),
});
