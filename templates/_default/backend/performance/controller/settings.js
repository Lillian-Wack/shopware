/**
 * Shopware 4.0
 * Copyright © 2012 shopware AG
 *
 * According to our dual licensing model, this program can be used either
 * under the terms of the GNU Affero General Public License, version 3,
 * or under a proprietary license.
 *
 * The texts of the GNU Affero General Public License with an additional
 * permission and of our proprietary license can be found at and
 * in the LICENSE file you have received along with this program.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * "Shopware" is a registered trademark of shopware AG.
 * The licensing of the program under the AGPLv3 does not imply a
 * trademark license. Therefore any rights, title and interest in
 * our trademarks remain entirely with us.
 *
 * @category   Shopware
 * @package    Shopware_Config
 * @subpackage Config
 * @copyright  Copyright (c) 2012, shopware AG (http://www.shopware.de)
 * @version    $Id$
 * @author shopware AG
 */

/**
 * Shopware Controller - Performance backend module
 *
 * The settings controller handles the 'settings' tab
 */
//{block name="backend/performance/controller/settings"}
Ext.define('Shopware.apps.Performance.controller.Settings', {
    extend: 'Enlight.app.Controller',

	/*
	 * Selector for easy access to the settings panel
	 */
    refs: [
        { ref: 'settings', selector: 'performance-tabs-settings-main' },
        { ref: 'cacheTime', selector: 'performance-tabs-settings-elements-cache-time' },
        { ref: 'noCache', selector: 'performance-tabs-settings-elements-no-cache' }
     
    ],

    snippets: {
        growlMessage: 'Performance Module',
        successTitle: 'Success',
        successMessage: 'Configuration successfully saves',
        errorTitle: 'Error',
        errorMessage: 'Error saving the configuration'
    },

	/*
	 * A reference to the current fieldSet being shown
	 */
	currentItem: null,

    /**
     * Init the controller, registert to some events
     */
    init: function () {
        var me = this;

        me.control({
            'performance-tabs-settings-main button[action=save-settings]': {
                click: function(button, event) {
                    me.onSave();
                }
            },
            'performance-tabs-settings-navigation': {
            	'itemClicked': me.onNavigationItemClicked
            }
        });

        me.callParent(arguments);
    },

    /**
     * Helper method to load the stores
     */
    loadConfigStore: function(callback) {
        var me = this;
        
        me.getStore('Config').load(function (records) {
            var storeData = records[0];

			me.injectConfig(storeData);

	        if (callback) {
	        	callback();
	        }
        });

    },
    
    /*
     * Takes a config record, loads it into the settings form and also sets
     * some stores
     */
    injectConfig: function(config) {
    	var me = this;
    	
        me.getSettings().panel.loadRecord(config);

        // reconfigure grids and inject the stores
        me.getCacheTime().reconfigure(me.deepCloneStore(config.getHttpCache().first().getCacheControllers()));
        me.getNoCache().reconfigure(me.deepCloneStore(config.getHttpCache().first().getNoCacheControllers()));

        me.configData = Ext.clone(config);
    },

	/*
	 * Called after the user clicked on an item in the navigation tree 
	 */
	onNavigationItemClicked: function(itemName) {
		var me = this,
			settings = me.getSettings(),
			itemToShow;
		
		// First of all: Hide all items:
		settings.panel.items.each(function(item) {
			item.hide();
			if (item.xtype == itemName) {
				itemToShow = item;
			}
		});
		
		// If no fieldSet is defined for the clicked item, return
		if (!itemToShow) {			
			me.currentItem = null;			
			return;
		}
		
		// Load the last saved configData into the form
        me.injectConfig(me.configData);
		itemToShow.show();
		me.currentItem = itemName;
	},
	
	
	
    /**
     * Callback function called when the users clicks the 'save' button on the settings form
     */
    onSave: function() {
        var me = this,
            settings = me.getSettings().panel,
            configRecord = settings.getRecord();

        settings.getForm().updateRecord(configRecord);
        
        //save the model and check in the callback function if the operation was successfully
        configRecord.save({
            callback:function (data, operation) {
                var records = operation.getRecords(),
                    record = records[0],
                    rawData = record.getProxy().getReader().rawData;

                if ( operation.success === true ) {
                	// Load the returned data
                    me.injectConfig(record);
                    Shopware.Notification.createGrowlMessage(me.snippets.successTitle, me.snippets.successMessage, me.snippets.growlMessage);
                } else {
                    Shopware.Notification.createGrowlMessage(me.snippets.errorTitle, me.snippets.errorMessage + '<br> ' + rawData.message, me.snippets.growlMessage)
                }
            }
        });

    },

    deepCloneStore: function (source) {
        var target = Ext.create ('Ext.data.Store', {
            model: source.model
        });

        Ext.each (source.getRange (), function (record) {
            var newRecordData = Ext.clone (record.copy().data);
            var model = new source.model (newRecordData, newRecordData.id);

            target.add (model);
        });

        return target;
    }

    });
//{/block}
