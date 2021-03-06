(function($) {

	var filter = function(map) {

		if(!map.conf.filteringLayers || map.conf.disableInteraction)
			return false;

		var	map_id = map.map_id,
			layers = map.conf.filteringLayers,
			swapWidget,
			switchWidget;

		layers.status = [];
		_.each(map.conf.layers, function(layerID) {
			var layer = {
				id: layerID,
				on: true
			};
			layers.status.push(layer);
		});

		var _build = function() {
			/*
			 * Swapables
			 */
			if(layers.swap && layers.swap.length >= 2) {
				var swap = layers.swap;
				var list = '';
				_.each(swap, function(layer) {
					var attrs = '';
					if(layer.first)
						attrs = 'class="active"';
					else
						filter.disableLayer(layer.id);
					list += '<li data-layer="' + layer.id + '" ' + attrs + '>' + layer.title + '</li>';
				});
				swapWidget = mappress.widget(map_id, '<ul class="swap-layers">' + list + '</ul>', 'swap-layers-widget', 'filter-layers');

				swapWidget.find('li').click(function() {
					filter.swap($(this).data('layer'), swap);
				});
			}

			/*
			 * Switchables
			 */
			if(layers.switch && layers.switch.length) {
				var switchable = layers.switch;
				var list = '';
				_.each(switchable, function(layer) {
					var attrs = 'class="active"';
					if(layer.hidden) {
						attrs = '';
						filter.disableLayer(layer.id);
					}
					list += '<li data-layer="' + layer.id + '" ' + attrs + '>' + layer.title + '</li>';
				});
				switchWidget = mappress.widget(map_id, '<ul class="switch-layers">' + list + '</ul>', 'switch-layers-widget', 'filter-layers');

				switchWidget.find('li').click(function() {
					filter.switch($(this).data('layer'));
				});
			}

			filter.update();
		}

		filter.switch = function(layer) {

			var widget = switchWidget;

			if(filter.getStatus(layer).on) {

				filter.disableLayer(layer);

				if(typeof widget != 'undefined')
					widget.find('li[data-layer="' + layer + '"]').removeClass('active');

			} else {

				filter.enableLayer(layer);

				if(typeof widget != 'undefined')
					widget.find('li[data-layer="' + layer + '"]').addClass('active');

			}

			filter.update();
		};

		filter.swap = function(layer) {

			var widget = swapWidget;

			if(filter.getStatus(layer).on)
				return;

			_.each(map.conf.filteringLayers.swap, function(swapLayer) {

				if(swapLayer.id == layer) {

					filter.enableLayer(layer);

					if(typeof widget != 'undefined')
						widget.find('li[data-layer="' + layer + '"]').addClass('active');

				} else {

					if(filter.getStatus(swapLayer.id).on) {

						filter.disableLayer(swapLayer.id);

						if(typeof widget != 'undefined')
							widget.find('li[data-layer="' + swapLayer.id + '"]').removeClass('active');

					}

				}
			});

			filter.update();
		};

		filter.disableLayer = function(layer) {

			layers.status[filter.getStatusIndex(layer)] = {
				id: layer,
				on: false
			}

		};

		filter.enableLayer = function(layer) {

			layers.status[filter.getStatusIndex(layer)] = {
				id: layer,
				on: true
			}

		};

		filter.update = function() {

			var layers = mappress.setupLayers(filter.getActiveLayers());

			mapbox.load(layers, function(data) {
				map.setLayerAt(0, data.layer);
				map.interaction.refresh();
			});

		};

		filter.getStatus = function(layer) {
			return _.find(layers.status, function(l) { return layer == l.id; });
		}

		filter.getStatusIndex = function(layer) {
			var index;
			_.each(layers.status, function(l, i) {
				if(layer == l.id)
					index = i;
			});
			return index;
		}

		filter.getActiveLayers = function() {
			var activeLayers = [];
			_.each(layers.status, function(layer) {
				if(layer.on)
					activeLayers.push(layer.id);
			});
			return activeLayers;
		}

		_build();

		return filter;

	};

	mappress.filterLayers = filter;

	mappress.mapReady(filter);

})(jQuery);